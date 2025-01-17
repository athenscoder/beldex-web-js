'use strict'

const View = require('../../Views/View.web')
const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')
const commonComponents_forms = require('../../MMAppUICommonComponents/forms.web')
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
const Currencies = require('../../CcyConversionRates/Currencies')

class FundsRequestQRDisplayView extends View {
  constructor (options, context) {
    super(options, context) // call super before `this`

    const self = this
    {
      const fundsRequest = options.fundsRequest || options.record // calling this `record` for now to standardize interface
      if (typeof fundsRequest === 'undefined' || !fundsRequest) {
        throw Error(self.constructor.name + ' requires a self.options.fundsRequest or self.options.record')
      }
      self.initializing__fundsRequest = fundsRequest || null
    }
    self.presentedModally = options.presentedModally === true
    self.setup()
  }

  TearDown () {
    super.TearDown()
  }

  setup () {
    const self = this
    self.setup_views()
  }

  setup_views () {
    const self = this
    self._setup_self_layer()
    self._setup_informationalHeaderLayer() // above the validation layer
    self._setup_qrCodeImageLayer()
  }

  _setup_self_layer () {
    const self = this

    const layer = self.layer
    layer.style.webkitUserSelect = 'none' // disable selection here but enable selectively
    layer.style.position = 'relative'
    layer.style.textAlign = 'center'
    layer.style.boxSizing = 'border-box'
    layer.style.width = '100%'
    layer.style.height = '100%'
    layer.style.padding = '0 0 40px 0' // actually going to change paddingTop in self.viewWillAppear() if navigation controller
    layer.style.overflowY = 'auto'
    layer.classList.add('ClassNameForScrollingAncestorOfScrollToAbleElement')
    layer.style.backgroundColor = '#272527' // so we don't get a strange effect when pushing self on a stack nav view
    layer.style.wordBreak = 'break-all' // to get the text to wrap
  }

  _setup_informationalHeaderLayer () {
    const self = this
    const layer = document.createElement('div')
    layer.style.width = 'calc(100% - 24px - 24px)'
    layer.style.boxSizing = 'border-box'
    layer.style.wordBreak = 'break-all'
    layer.style.textAlign = 'center'
    layer.style.margin = '26px 24px 18px 24px'
    layer.style.paddingBottom = '10px' // for spacing
    layer.style.color = '#9E9C9E'
    layer.style.fontSize = '13px'
    layer.style.webkitUserSelect = 'all'
    layer.style.MozUserSelect = 'all'
    layer.style.msUserSelect = 'all'
    layer.style.userSelect = 'all'
    layer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
    let innerHTML = ''
    {
      const payment_id = self.initializing__fundsRequest.payment_id
      const amount = self.initializing__fundsRequest.amount
      const amountCcySymbol = self.initializing__fundsRequest.amountCcySymbol || Currencies.ccySymbolsByCcy.XMR
      const to_address = self.initializing__fundsRequest.to_address
      innerHTML = 'Scan this code to send '
      if (amount) {
        innerHTML += amount + ' ' + amountCcySymbol
        if (amountCcySymbol != Currencies.ccySymbolsByCcy.XMR) {
          innerHTML += ' in Monero'
        }
      } else {
        innerHTML += 'Monero'
      }
      if (payment_id != null && payment_id != '' && typeof payment_id !== 'undefined') {
        innerHTML += ' with payment ID ' + payment_id
      }
      innerHTML += ' to ' + to_address
      innerHTML += '.'
    }
    layer.innerHTML = innerHTML
    self.informationalHeaderLayer = layer
    self.layer.appendChild(layer)
  }

  _setup_qrCodeImageLayer () {
    const self = this
    const container = document.createElement('div')
    container.style.width = '66%'
    container.style.height = 'auto'
    container.style.maxWidth = '380px'
    container.style.display = 'inline-block' // margin: '0 auto' didn't work
    container.style.margin = '0'
    //
    const imgDataURIString = self.initializing__fundsRequest.qrCode_imgDataURIString

    { // right
      const buttonLayer = commonComponents_tables.New_customButton_aLayer(
        self.context,
        'SAVE',
        true, // isEnabled, defaulting to true on undef
        function () {
          buttonLayer.Component_SetEnabled(false)
          self.context.userIdleInWindowController.TemporarilyDisable_userIdle() // TODO: this is actually probably a bad idea - remove this and ensure that file picker canceled on app teardown
          // ^ so we don't get torn down while dialog open
          function __trampolineFor_didFinish () { // ^ essential we call this from now on if we are going to finish with this codepath / exec control
            buttonLayer.Component_SetEnabled(true)
            self.context.userIdleInWindowController.ReEnable_userIdle()
          }
          self.context.filesystemUI.PresentDialogToSaveBase64ImageStringAsImageFile(
            imgDataURIString,
            'Save Beldex Request',
            'Beldex request',
            function (err) {
              if (err) {
                const errString = err.message
                  ? err.message
                  : err.toString()
                    ? err.toString()
                    : '' + err
                navigator.notification.alert(
                  errString,
                  function () {}, // nothing to do
                  'Error',
                  'OK'
                )
                __trampolineFor_didFinish()
                return
              }
              // console.log("Downloaded QR code")
              __trampolineFor_didFinish() // re-enable idle timer
            }
          )
        }
      )
      buttonLayer.style.float = 'right'
      buttonLayer.style.marginRight = '0'
      buttonLayer.style.marginBottom = '11px'
      container.appendChild(buttonLayer)
    }
    container.appendChild(commonComponents_tables.New_clearingBreakLayer())

    const layer = commonComponents_tables.New_fieldValue_base64DataImageLayer(
      imgDataURIString,
      self.context
    )
    layer.style.width = '100%'
    layer.style.height = 'auto'
    layer.style.margin = '0'

    container.appendChild(layer)
    self.layer.appendChild(container)
  }

  //
  // Runtime - Accessors - Navigation
  Navigation_Title () {
    return 'Scan Code to Pay'
  }

  Navigation_New_LeftBarButtonView () {
    const self = this
    if (self.initializing__fundsRequest.is_displaying_local_wallet == true && self.presentedModally != true) {
      return null // it's pushed onto a stack instead
    }
    const view = commonComponents_navigationBarButtons.New_LeftSide_CancelButtonView(self.context, 'Done')
    self.leftBarButtonView = view
    const layer = view.layer
    layer.addEventListener(
      'click',
      function (e) {
        e.preventDefault()
        self.dismissView()
        return false
      }
    )
    return view
  }

  //
  // Imperatives - Modal
  dismissView () {
    const self = this
    const modalParentView = self.navigationController.modalParentView
    setTimeout(function () { // just to make sure the PushView is finished
      modalParentView.DismissTopModalView(true)
    })
  }

  //
  // Runtime - Delegation - Navigation/View lifecycle
  viewWillAppear () {
    const self = this
    super.viewWillAppear()
    if (typeof self.navigationController !== 'undefined' && self.navigationController !== null) {
      self.layer.style.paddingTop = `${self.navigationController.NavigationBarHeight()}px`
    }
  }
}
module.exports = FundsRequestQRDisplayView
