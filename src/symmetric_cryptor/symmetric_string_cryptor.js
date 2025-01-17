const crypto = require('crypto')
const currentVersionCryptorFormatVersion = 3
const cryptor_settings =
{
  algorithm: 'aes-256-cbc',
  options: 1, // this gets inserted into the format. should probably be renamed to something more concretely descriptive
  salt_length: 8,
  iv_length: 16,
  pbkdf2:
	{
	  iterations: 10000,
	  key_length: 32
	},
  hmac:
	{
	  includes_header: true,
	  algorithm: 'sha256',
	  length: 32
	}
}
//
// Encryption
function New_EncryptedBase64String__Async (plaintext_msg, password, fn) {
  if (typeof plaintext_msg === 'undefined') {
    return undefined
  }
  if (plaintext_msg == null) {
    return null
  }
  Buffer.isBuffer(plaintext_msg) || (plaintext_msg = new Buffer(plaintext_msg, 'utf8')) // we're expecting a string, but might as well check anyway
  Buffer.isBuffer(password) || (password = new Buffer(password, 'utf8')) // we're expecting a string, but might as well check anyway
  //
  const components =
	{
	  headers:
		{
		  version: new Buffer(String.fromCharCode(currentVersionCryptorFormatVersion)),
		  options: new Buffer(String.fromCharCode(cryptor_settings.options))
		}
	}
  components.headers.encryption_salt = _new_random_salt()
  components.headers.hmac_salt = _new_random_salt()
  components.headers.iv = _new_random_iv_of_length(cryptor_settings.iv_length)
  //
  // TODO: maybe do the key gen here in parallel
  _new_calculated_pbkdf2_key__async(
    password,
    components.headers.encryption_salt,
    function (err, encryption_key) {
      if (err) {
        fn(err)
        return
      }
      _new_calculated_pbkdf2_key__async(
        password,
        components.headers.hmac_salt,
        function (err, hmac_key) {
          if (err) {
            fn(err)
            return
          }
          const iv = components.headers.iv
          if (Buffer.isBuffer(iv) == false) {
            throw Error('Expected Buffer.isBuffer(iv)')
          }
          if (Buffer.isBuffer(encryption_key) == false) {
            throw Error('Expected Buffer.isBuffer(encryption_key)')
          }
          if (cryptor_settings.iv_length !== components.headers.iv.length) {
            throw Error('Expected cryptor_settings.iv_length == components.headers.iv.length')
          }
          const cipher = crypto.createCipheriv(
            cryptor_settings.algorithm,
            encryption_key,
            iv
          )
          // pkcs padding is done automatically; see cipher.setAutoPadding
          components.cipher_text = Buffer.concat([
            cipher.update(plaintext_msg),
            cipher.final()
          ])
          const data = Buffer.concat([
            components.headers.version,
            components.headers.options,
            components.headers.encryption_salt || new Buffer(''),
            components.headers.hmac_salt || new Buffer(''),
            components.headers.iv,
            components.cipher_text
          ])
          const hmac = _new_generated_hmac(components, hmac_key)
          const encryptedMessage_base64String = Buffer.concat([data, hmac]).toString('base64')
          //
          fn(null, encryptedMessage_base64String)
        }
      )
    }
  )
}
module.exports.New_EncryptedBase64String__Async = New_EncryptedBase64String__Async
//
// Decryption
function New_DecryptedString__Async (encrypted_msg_base64_string, password, fn) {
  Buffer.isBuffer(password) || (password = new Buffer(password, 'utf8'))

  if (!encrypted_msg_base64_string || typeof encrypted_msg_base64_string === 'undefined') {
    console.warn('New_DecryptedString__Async was passed nil encrypted_msg_base64_string')
    return fn(null, encrypted_msg_base64_string)
  }
  const unpacked_base64_components = _new_encrypted_base64_unpacked_components_object(encrypted_msg_base64_string)
  _is_hmac_valid__async(
    unpacked_base64_components,
    password,
    function (err, isValid) {
      if (err) {
        fn(err)
        return
      }
      if (isValid === false) {
        const err = new Error('HMAC is not valid.')
        fn(err)
        return
      }
      _new_calculated_pbkdf2_key__async(
        password,
        unpacked_base64_components.headers.encryption_salt,
        function (err, cipherKey_binaryBuffer) {
          if (err) {
            fn(err)
            return
          }
          const deCipher = crypto.createDecipheriv(
            cryptor_settings.algorithm,
            cipherKey_binaryBuffer,
            unpacked_base64_components.headers.iv
          )
          // pkcs unpadding is done automatically; see cipher.setAutoPadding
          const unpadded_decrypted_buffer = Buffer.concat([
            deCipher.update(unpacked_base64_components.cipher_text),
            deCipher.final()
          ])
          const decrypted_string = unpadded_decrypted_buffer.toString('utf8')
          //
          fn(null, decrypted_string)
        }
      )
    }
  )
}
module.exports.New_DecryptedString__Async = New_DecryptedString__Async
//
// Shared
function _new_encrypted_base64_unpacked_components_object (b64str) {
  if (!b64str || typeof b64str === 'undefined') { // prevent toString() exception
    throw '_new_encrypted_base64_unpacked_components_object was passed nil b64str'
    // return undefined
  }
  const data = new Buffer(b64str, 'base64')
  const components =
	{
	  headers: _new_parsed_headers_object(data),
	  hmac: data.slice(data.length - cryptor_settings.hmac.length)
	}
  const header_length = components.headers.length
  const cipher_text_length = data.length - header_length - components.hmac.length
  components.cipher_text = data.slice(header_length, header_length + cipher_text_length)
  //
  return components
}
function _new_parsed_headers_object (buffer_data) {
  let offset = 0

  const version_char = buffer_data.slice(offset, offset + 1)
  offset += version_char.length

  validate_schema_version(version_char.toString('binary').charCodeAt())

  const options_char = buffer_data.slice(offset, offset + 1)
  offset += options_char.length

  const encryption_salt = buffer_data.slice(offset, offset + cryptor_settings.salt_length)
  offset += encryption_salt.length

  const hmac_salt = buffer_data.slice(offset, offset + cryptor_settings.salt_length)
  offset += hmac_salt.length

  const iv = buffer_data.slice(offset, offset + cryptor_settings.iv_length)
  offset += iv.length

  const parsing_description =
	{
	  version: version_char,
	  options: options_char,
	  encryption_salt: encryption_salt,
	  hmac_salt: hmac_salt,
	  iv: iv,
	  length: offset
	}

  return parsing_description
}
function validate_schema_version (version) {
  if (version !== currentVersionCryptorFormatVersion) {
    const err = 'Unsupported schema version ' + version
    throw err
  }
}
function _is_hmac_valid__async (
  components,
  password,
  fn // (err, isValid?) -> Void
) {
  _new_calculated_pbkdf2_key__async(
    password,
    components.headers.hmac_salt,
    function (err, hmac_key) {
      if (err) {
        fn(err)
        return
      }
      const generated_hmac_buffer = _new_generated_hmac(components, hmac_key)
      // For 0.11+ we can use Buffer.compare
      const isValid = components.hmac.toString('hex') == generated_hmac_buffer.toString('hex')
      //
      fn(null, isValid)
    }
  )
}
function _new_calculated_pbkdf2_key__async (password, salt, fn) { // Apply pseudo-random function HMAC-SHA1 by default
  crypto.pbkdf2(
    password,
    salt,
    cryptor_settings.pbkdf2.iterations,
    cryptor_settings.pbkdf2.key_length,
    'sha1',
    function (err, key) {
      fn(err, key)
    }
  )
}
let _new_generated_hmac = function (components, hmac_key) {
  let hmac_message = new Buffer('')
  if (cryptor_settings.hmac.includes_header) {
    hmac_message = Buffer.concat([
      hmac_message,
      components.headers.version,
      components.headers.options,
      components.headers.encryption_salt || new Buffer(''),
      components.headers.hmac_salt || new Buffer(''),
      components.headers.iv
    ])
  }
  hmac_message = Buffer.concat([hmac_message, components.cipher_text])
  return crypto.createHmac(
    cryptor_settings.hmac.algorithm,
    hmac_key
  ).update(
    hmac_message
  ).digest()
}
function _new_random_salt () {
  return _new_random_iv_of_length(cryptor_settings.salt_length)
}
function _new_random_iv_of_length (block_size) {
  try {
    const raw_ivBuffer = crypto.randomBytes(block_size)
    const final_ivBuffer = raw_ivBuffer.slice(0, block_size) // not sure if this slice is actually necessary with the randomBytes call

    return final_ivBuffer
  } catch (ex) {
    // TODO: handle error (this should be getting caught in consumer anyway)
    // most likely, entropy sources are drained
    throw ex
  }
}
