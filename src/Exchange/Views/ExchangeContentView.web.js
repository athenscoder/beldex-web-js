// "use strict"

const View = require('../../Views/View.web')
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
const JSBigInt = require('@mymonero/mymonero-bigint').BigInteger // important: grab defined export
const monero_amount_format_utils = require('@mymonero/mymonero-money-format')

class ExchangeContentView extends View {
  constructor (options, context) {
    super(options, context)
    const ecvSelf = this
    const self = context

    //
    const view = new View({}, self.context)
    const layer = view.layer
    const margin_side = 16
    const marginTop = 56
    layer.style.marginTop = `${marginTop}px`
    layer.style.marginLeft = margin_side + 'px'
    layer.style.width = `calc(100% - ${2 * margin_side}px)`
    layer.style.height = `calc(100% - ${marginTop}px - 15px)`

    ecvSelf._setup_emptyStateContainerView(context)
    ecvSelf._setup_views()
    ecvSelf.observerIsSet = false

    const interval = setInterval(function () {
      // if wallets exist, setup the wallet selector for the exchange page
      try {
        if (context.walletsListController.records !== undefined) {
          // ecvSelf._setup_walletExchangeOptions(self.context);
        }
      } catch {
        // wallet not instantiated yet, no need to display notices
      }
      ecvSelf._refresh_sending_fee()
    }, 2000)
    ecvSelf.keepExchangeOptionsUpdated = interval
  }

  _setup_walletExchangeOptions (context) {
    const self = this
    const walletDiv = document.getElementById('wallet-selector')
    if (walletDiv === null) {
      return
    }
    // if the user has selected a wallet, we update the balances for the

    // get oldest wallet based on how wallets are inserted into wallets as a zero element, changing indexes backwards
    const defaultOffset = 0
    const defaultWallet = context.walletsListController.records[defaultOffset]
    const walletSelectOptions = `
        <div data-walletoffset="0" data-walletpublicaddress="${defaultWallet.public_address}" data-walletLabel="${defaultWallet.walletLabel}" data-swatch="${defaultWallet.swatch.substr(1)}" data-walletbalance="${self.UnlockedBalance_FormattedString(defaultWallet)}" data-walletid="${defaultWallet._id}" id="selected-wallet" class="hoverable-cell utility selectionDisplayCellView" style="">
                <div id="selected-wallet-icon" class="walletIcon medium-32" style="background-image: url(./src/assets/img/wallet-00C6FF@3x.png)"></div>
                <div id="selected-wallet-label" class="walletName">${defaultWallet.walletLabel}</div>
                <div id="selected-wallet-balance" class="description-label">${self.UnlockedBalance_FormattedString(defaultWallet)} XMR available</div>
            </div>
            <div id="wallet-options" class="options_containerView">
                <div class="options_cellViews_containerView" style="position: relative; left: 0px; top: 0px; width: 100%; height: 100%; z-index: 20; overflow-y: auto; max-height: 174.9px;">
                </div>
            </div>
        `
    walletDiv.innerHTML = walletSelectOptions
  }

  _refresh_sending_fee () {
    const self = this
    const tx_fee = document.getElementById('tx-fee')
    if (tx_fee !== null) {
      tx_fee.dataset.txFee = self._new_estimatedNetworkFee_displayString()
      tx_fee.innerHTML = `<span class="field_title form-field-title" style="margin-top: 8px; color: rgb(158, 156, 158); display: inline-block;">+ ${self._new_estimatedNetworkFee_displayString()} XMR EST. FEE</span>`
    }
  }

  _setup_views () {
    // // to do -- clean up interval timers a bit.
    // const self = this
    // super._setup_views()
    // self._setup_emptyStateContainerView()
    // self.observerIsSet = false;

    // let interval = setInterval(function() {
    //     // if wallets exist, setup the wallet selector for the exchange page
    //     if (self.context.wallets !== undefined) {
    //         self._setup_walletExchangeOptions(self.context);
    //     }
    //     self._refresh_sending_fee();
    // }, 4000);
    // self.keepExchangeOptionsUpdated = interval; // we use a named interval attached to the view so that we can stop it if we ever want to;
  }

  _setup_emptyStateContainerView (context) {
    // TODO: wrap this in a promise so that we can execute logic after this
    const self = this

    // We run this on an interval because of the way DOM elements are instantiated. Our Exchange DOM only renders once a user clicks the XMR->BTC menu tab
    const initialExchangeInit = setInterval(() => {
      const walletDiv = document.getElementById('wallet-selector')
      if (walletDiv !== null) {
        clearInterval(self.initialExchangeInit)
        self._setup_walletExchangeOptions(self.context)
      }
    }, 200)

    self.initialExchangeInit = initialExchangeInit

    const view = new View({}, self.context)
    {
      const layer = view.layer
      layer.classList.add('emptyScreens')
      layer.classList.add('empty-page-panel')
    }
    let contentContainerLayer
    {
      const layer = document.createElement('div')
      layer.classList.add('content-container')
      layer.classList.add('empty-page-content-container')
      view.layer.appendChild(layer)
      contentContainerLayer = layer
      // layer.classList.add("xmr_input");
      const html = `
            <style>
                .NavigationBarView + div {}
            </style>
            <div class="exchangeScreen exchange-page-panel">
                <div class="content-container exchange-page-content-container">
                    <div id="server-rates-messages"></div>
                    <div id="loader" class="active">
                        <!-- gets replaced by loader -->
                    </div>`
      layer.innerHTML = html
    }

    {
      const layer = document.createElement('div')
      layer.classList.add('message-label')
      layer.classList.add('exchangeRate')
      layer.id = 'explanatory-message'
      layer.innerHTML = 'You can exchange XMR to Bitcoin here. Please wait while we load rates.'
      contentContainerLayer.appendChild(layer)
    }

    {
      // const layer = document.createElement("div")
      // layer.id = "localmonero";
      // layer.innerHTML = "Buy Monero using LocalMonero";
      // layer.style.textTransform = "uppercase";
      // layer.style.display = "none";

      // contentContainerLayer.appendChild(layer)
    }

    {
      // Send Funds
      const layer = document.createElement('div')
      // we use ES6's spread operator (...buttonClasses) to invoke the addition of classes -- cleaner than a foreach
      const buttonClasses = ['base-button', 'hoverable-cell', 'navigation-blue-button-enabled', 'action', 'right-add-button', 'exchange-button']
      layer.classList.add(...buttonClasses)
      layer.id = 'exchange-xmr'
      layer.innerText = 'Exchange XMR'
      const orderSent = false
      layer.addEventListener('click', function (orderSent) {
        const exchangeXmrDiv = document.getElementById('exchange-xmr')
        exchangeXmrDiv.classList.remove('active')

        /*
                    * We define the status update and the response handling function here, since we need to update the DOM with status feedback from the monero-daemon.
                    * We pass them as the final argument to ExchangeUtils.sendFunds
                    * It performs the necessary DOM-based status updates in this file so that we don't tightly couple DOM updates to a Utility module.
                    */
        function validation_status_fn (str) {
          const monerodUpdates = document.getElementById('monerod-updates')
          monerodUpdates.innerText = str
        }
        /*
                    * We perform the necessary DOM-based status updates in this file so that we don't tightly couple DOM updates to a Utility module.
                    */
        function handle_response_fn (err, mockedTransaction) {
          let str
          const monerodUpdates = document.getElementById('monerod-updates')
          if (err) {
            str = typeof err === 'string' ? err : err.message
            monerodUpdates.innerText = str
            return
          }
          str = 'Sent successfully.'
          monerodUpdates.innerText = str
        }
        // No cancel handler code since we don't provide a cancel method
        function cancelled_fn () { // canceled_fn
          // No cancel handler code since we don't provide a cancel method
        }
        /*
                    * We declare sendfunds here to have access to the context object
                    */

        function sendFunds (wallet, xmr_amount, xmr_send_address, sweep_wallet, validation_status_fn, handle_response_fn, context) {
          if (context.walletsListController.orderSent == true) {
            console.log('Duplicate order')
          } else {
            try {
              return new Promise((resolve, reject) => {
                context.walletsListController.orderSent = true

                const enteredAddressValue = xmr_send_address // ;
                const resolvedAddress = ''
                const manuallyEnteredPaymentID = ''
                const resolvedPaymentID = ''
                const hasPickedAContact = false
                const manuallyEnteredPaymentID_fieldIsVisible = false
                const resolvedPaymentID_fieldIsVisible = false
                const resolvedAddress_fieldIsVisible = false
                let contact_payment_id
                let cached_OAResolved_address
                let contact_hasOpenAliasAddress
                let contact_address
                const raw_amount_string = xmr_amount // XMR amount in double
                const sweeping = sweep_wallet
                const simple_priority = 1

                wallet.SendFunds(
                  enteredAddressValue,
                  resolvedAddress,
                  manuallyEnteredPaymentID,
                  resolvedPaymentID,
                  hasPickedAContact,
                  resolvedAddress_fieldIsVisible,
                  manuallyEnteredPaymentID_fieldIsVisible,
                  resolvedPaymentID_fieldIsVisible,
                  contact_payment_id,
                  cached_OAResolved_address,
                  contact_hasOpenAliasAddress,
                  contact_address,
                  raw_amount_string,
                  sweeping,
                  simple_priority,
                  validation_status_fn,
                  cancelled_fn,
                  handle_response_fn
                )
              })
            } catch (error) {
              context.walletsListController.orderSent = false
              console.log(error)
            }
          }
        } // end of function

        const xmr_amount = document.getElementById('in_amount_remaining').innerHTML
        const xmr_send_address = document.getElementById('receiving_subaddress').innerHTML
        const xmr_amount_str = '' + xmr_amount

        const selectedWallet = document.getElementById('selected-wallet')
        const selectorOffset = selectedWallet.dataset.walletoffset
        const sweep_wallet = false // TODO: Add sweeping functionality
        try {
          if (context.walletsListController.hasOwnProperty('orderSent')) {
            console.log('Order already sent previously')
          } else {
            context.walletsListController.orderSent = false
          }
          sendFunds(context.walletsListController.records[0], xmr_amount_str, xmr_send_address, sweep_wallet, validation_status_fn, handle_response_fn, context)
        } catch (error) {
          console.log(error)
        }
      })

      contentContainerLayer.appendChild(layer)
    }
    {
      // let's make the xmr.to form in HTML for sanity's sake
      const layer = document.createElement('div')
      // layer.classList.add("xmr_input");
      let html = '    <div>'
      // html += fs.readFileSync(__dirname + '/Body.html', 'utf8');
      html += `
            <div id="orderStatusPage">
            <div id="wallet-selector" class="WalletSelectView ListCustomSelectView form_field">
                        <!-- we insert this html dynamically from ECV.web.js -->
            </div>
            <div class="form_field" id="currency-table">
                <table class="full-width">
                    <tr>
                        <td>   
                            <div class="field_title form-field-title">XMR to send
                                <div style="position: relative; left: 0px; top: 0px; padding: 2px 0 0 0;">
                                    <span class="field_title form-field-title label-spacing" style="margin-top: 0px;">AMOUNT</span>
                                    <input id="XMRcurrencyInput" class="textInput currencyInput" type="text" placeholder="00.00" value="">
                                    <select id="currencySelect"><option value="XMR" style="text-align: center;">XMR</option></select>    
                                </div>
                            </div>
                        </td>
                        <td>
                            <div id="BTCInputDiv" class="field_title form-field-title">BTC you will receive
                                <div class="" style="position: relative; left: 0px; top: 0px; padding: 2px 0 0 0">
                                    <span class="field_title form-field-title label-spacing" style="margin-top: 0px;">AMOUNT</span>
                                    <input id="BTCcurrencyInput" class="textInput currencyInput" type="text" placeholder="00.00" value="">
                                    <select id="currencySelect"><option value="BTC" style="text-align: center;">BTC</option></select>    
                                </div>
                            </div>
                        </td>
                    </tr>
                    <input id="in_address" type="hidden" value="">
                </table>
            </div>
            <div class="form_field" id="tx-fee">
                    <span class="field_title form-field-title" style="margin-top: 8px; color: rgb(158, 156, 158); display: inline-block;">Loading ...</span>
                </div>
                
    
                <div class="form_field" id="btc-address">
                    <span class="field_title form-field-title" style="margin-top: 17px;">DESTINATION BITCOIN ADDRESS
                    </span>
                    <div class="contactPicker" style="position: relative; width: 100%; user-select: none;">
                        <input id="btcAddress" class="full-width longTextInput" type="text" placeholder="Destination BTC Address" autocomplete="off" autocapitalize="none" spellcheck="false" value="">
                    </div>
                </div>
                <div id="localmonero"><a href="#" id="localmonero-anchor" class="clickableLinkButton">Buy Monero using LocalMonero</a></div>
                <div id="indacoin"><a href="#" id="indacoin-anchor" class="clickableLinkButton">Buy Monero using Indacoin</a></div>
                <div id="validation-messages"></div>
                <div id="address-messages"></div>
                <div id="server-messages"></div>
    
            </div>
                    
            </div>
            <div id="order-status">
    
            </div>
        </div>
        <div id="exchangePage">
            <div class="field_title form-field-title">
                <table>
                    <tr>
                    <td colspan="2" style="word-wrap: normal; word-break: normal;">Please note an exchange may take a few minutes to process. <span class="provider-name"></span> are able to provide support for any exchanges. For all issues, please contact <span class="provider-name"></span> with your UUID for assistance.</td>
                    </tr>
                    <tr>
                        <td>
                            <div class="field_title form-field-title uppercase">
                                <div style="position: relative; left: 0px; top: 0px; padding: 2px 0 0 0;">
                                    <span class="field_title form-field-title label-spacing uppercase" style="margin-top: 0px;"><span class="provider-name"></span> UUID</span>
                                    <div id="provider_order_id" class="textInput currencyOutput" type="text" placeholder="0.00" style="text-transform: none !important"></div>
                                    <div class="currencySelect"><option value="XMR" style="text-align: center;">&nbsp;&nbsp;&nbsp;&nbsp;</option></select> 
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="field_title form-field-title uppercase">Time Remaining
                                <div id="clock">
                                    <span id="minutesRemaining"></span>
                                    <span>:</span>
                                    <span id="secondsRemaining"></span>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div class="field_title form-field-title">Remaining XMR payable
                                <div style="position: relative; left: 0px; top: 0px; padding: 2px 0 0 0;">
                                    <span class="field_title form-field-title label-spacing" style="margin-top: 0px;">AMOUNT</span>
                                    <div id="in_amount_remaining" class="textInput currencyOutput" type="text" placeholder="0.00">Loading</div>
                                    <div class="currencySelect"><option value="XMR" style="text-align: center;">XMR</option>    
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="field_title form-field-title">BTC to be paid out
                                <div class="" style="position: relative; left: 0px; top: 0px; padding: 2px 0 0 0">
                                    <span class="field_title form-field-title label-spacing" style="margin-top: 0px;">AMOUNT</span>
                                    <div id="out_amount" class="textInput currencyOutput" type="text">Loading</div>
                                    <div class="currencySelect"><option value="BTC" style="text-align: center;">BTC</option>    
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div class="field_title form-field-title uppercase label-spacing">
                                <div class="" style="position: relative; left: 0px; top: 0px; padding: 2px 0 0 0">
                                    <span class="field_title form-field-title label-spacing" style="margin-top: 0px;">Order Status</span>
                                    <div class="order-status textInput currencyOutput" id="status"></div>
                                    <div class="currencySelect"><option value="XMR" style="text-align: center;">&nbsp;&nbsp;&nbsp;</option>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="field_title form-field-title hidden">
                    <table class="full-width" style="display: none;">
                        <tr>
                            <td>
                                <div class="field_title form-field-title">Receiving subaddress
                                    <div style="position: relative; left: 0px; top: 0px; padding: 2px 0 0 0;">
                                        <div id="receiving_subaddress" class="textInput currencyOutput" type="text">Loading</div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </table>
            </div>
            <div id="monerod-updates" class="validationWindow">
    
            </div>
                <table class="hidden">
                    <tr>
                        <td>btc_amount_partial</td>
                        <td id="btc_amount_partial"> "0"</td>
                    </tr>
                    <tr>
                        <td>btc_dest_address</td>
                        <td id="in_address"> "2NBaUzuYqJvbThw77QVqq8NEXmkmDmSooy9"</td>
                    </tr>
    
                    <tr>
                        <td>expires_at</td>
                        <td id="expires_at"> "2020-08-07T13:54:30Z"</td>
                    </tr>
                    <tr>
                        <td>incoming_amount_total</td>
                        <td id="in_amount"> "1"</td>
                    </tr>
    
                    <tr>
                        <td>incoming_price_btc</td>
                        <td id="incoming_price_btc"> "0.00789659"</td>
                    </tr>
                    <tr>
                        <td>receiving_subaddress</td>
                        <td id="receiving_subaddress"> "72FsJzvGG4x97vvjwu9V6e8hBBfB3bhrqVEEoPsxrkjAVgQUnbA22cbgMmu5b4Lx6cQ75vnjPVs9HUB1L32yBMhaNsi7KrD"</td>
                    </tr>
                    <tr>
                        <td>remaining_amount_incoming</td>
                        <td id="remaining_amount_incoming"> "1"</td>
                    </tr>
                    <tr>
                        <td>uuid</td>
                        <td id="uuid"> "xmrto-NCXzGE"</td>
                    </tr>
                </table>            
            </div>
        </div>
    </div>
    `
      layer.innerHTML = html
      contentContainerLayer.appendChild(layer)
    }

    self.emptyStateMessageContainerView = view
    self.addSubview(view)

    const a = document.getElementById('server-invalid')

    let initialized = false

    const exchangeInitTimer = setInterval((context, options) => {
      const loaderPage = document.getElementById('loader')
      if (typeof (loaderPage) === undefined) {
        return
      }
      const Utils = require('../Javascript/ExchangeUtilityFunctions')
      const ExchangeLibrary = require('mymonero-exchange')
      const ExchangeFunctions = new ExchangeLibrary()
      const ExchangeUtils = require('../Javascript/ExchangeUtilityFunctions')
      const ValidationLibrary = require('wallet-address-validator')
      const order = {}
      const exchangePage = document.getElementById('orderStatusPage')
      const btcAddressInput = document.getElementById('btcAddress')
      const walletSelector = document.getElementById('wallet-selector')
      const walletOptions = document.getElementById('wallet-options')
      const exchangeXmrDiv = document.getElementById('exchange-xmr')
      let orderStarted = false
      const orderCreated = false
      const orderStatusPage = document.getElementById('orderStatusPage')
      // let backBtn = document.getElementsByClassName('nav-button-left-container')[0];
      // backBtn.style.display = "none";
      const addressValidation = document.getElementById('address-messages')
      const serverValidation = document.getElementById('server-messages')
      const explanatoryMessage = document.getElementById('explanatory-message')
      const selectedWallet = document.getElementById('selected-wallet')
      const serverRatesValidation = document.getElementById('server-rates-messages')
      const XMRcurrencyInput = document.getElementById('XMRcurrencyInput')
      const BTCcurrencyInput = document.getElementById('BTCcurrencyInput')
      const validationMessages = document.getElementById('validation-messages')
      const orderBtn = document.getElementById('order-button')
      let orderTimer = {}
      let currencyInputTimer
      const orderStatusDiv = document.getElementById('exchangePage')

      function validateBTCAddress (address, ValidationLibrary) {
        try {
          if (ValidationLibrary.validate(address) == false) {
            console.log(ValidationLibrary.validate(address))
            return false
          }
        } catch (Error) {
          console.log(Error)
        }
        console.log(ValidationLibrary.validate(address))
        return true
      }

      const BTCAddressInputListener = function () {
        const btcAddressInput = document.getElementById('btcAddress')
        addressValidation.innerHTML = ''

        if (validateBTCAddress(btcAddressInput.value, ValidationLibrary) == false) {
          const error = document.createElement('div')
          error.classList.add('message-label')
          error.id = 'btc-invalid'
          error.innerHTML = 'Your BTC address is not valid.'
          addressValidation.appendChild(error)
        }
      }

      const XMRCurrencyInputKeydownListener = function (event) {
        if (event.which == 8 || event.which == 110 || event.which == 46 || event.which == 190) { return }

        if ((event.which >= 48 && event.which <= 57) || (event.which >= 96 && event.which <= 105)) {
          return
        }

        if (!checkDecimals(XMRcurrencyInput.value, 12)) {
          event.preventDefault()
          return
        }

        event.preventDefault()
      }

      const BTCCurrencyInputKeydownListener = function (event) {
        if (event.which == 8 || event.which == 110 || event.which == 46 || event.which == 190) { return }

        if ((event.which >= 48 && event.which <= 57) || (event.which >= 96 && event.which <= 105)) {
          return
        }

        if (!checkDecimals(BTCcurrencyInput.value, 8)) {
          event.preventDefault()
          return
        }

        event.preventDefault()
      }

      const btcBalanceChecks = function () {
        let BTCToReceive
        const BTCbalance = parseFloat(BTCcurrencyInput.value)
        const out_amount = BTCbalance.toFixed(12)
        XMRcurrencyInput.value = 'Loading...'
        if (currencyInputTimer !== undefined) {
          clearTimeout(currencyInputTimer)
        }

        if (ExchangeFunctions.currentRates.out_min > BTCbalance) {
          const error = document.createElement('div')
          error.classList.add('message-label')
          error.id = 'xmrexceeded'
          error.innerHTML = `You cannot exchange less than ${ExchangeFunctions.currentRates.out_min} BTC`
          validationMessages.appendChild(error)
          return
        }
        if (ExchangeFunctions.currentRates.out_max < BTCbalance) {
          const error = document.createElement('div')
          error.classList.add('message-label')
          error.id = 'xmrexceeded'
          error.innerHTML = `You cannot exchange more than ${ExchangeFunctions.currentRates.out_max} BTC`
          validationMessages.appendChild(error)
          return
        }
        validationMessages.innerHTML = ''
        serverValidation.innerHTML = ''
        currencyInputTimer = setTimeout(() => {
          ExchangeFunctions.getOfferWithOutAmount(ExchangeFunctions.in_currency, ExchangeFunctions.out_currency, out_amount)
            .then((response) => {
              const XMRtoReceive = parseFloat(response.in_amount)
              const selectedWallet = document.getElementById('selected-wallet')
              const tx_feeElem = document.getElementById('tx-fee')
              const tx_fee = tx_feeElem.dataset.txFee
              const tx_fee_double = parseFloat(tx_fee)
              const walletMaxSpendDouble = parseFloat(selectedWallet.dataset.walletbalance)
              const walletMaxSpend = walletMaxSpendDouble - tx_fee
              // let BTCToReceive = XMRcurrencyInput.value * exchangeFunctions.currentRates.price;
              // let XMRbalance = parseFloat(XMRcurrencyInput.value);
              const BTCCurrencyValue = parseFloat(BTCcurrencyInput.value)

              if ((walletMaxSpend - XMRtoReceive) < 0) {
                const error = document.createElement('div')
                error.classList.add('message-label')
                error.id = 'xmrexceeded'
                error.innerHTML = `You cannot exchange more than ${walletMaxSpend} XMR`
                validationMessages.appendChild(error)
              }

              if (BTCCurrencyValue.toFixed(12) > ExchangeFunctions.currentRates.upper_limit) {
                const error = document.createElement('div')
                error.id = 'xmrexceeded'
                error.classList.add('message-label')
                const btc_amount = parseFloat(ExchangeFunctions.currentRates.upper_limit)
                error.innerHTML = `You cannot exchange more than ${btc_amount} BTC.`
                validationMessages.appendChild(error)
              }
              if (BTCCurrencyValue.toFixed(8) < ExchangeFunctions.currentRates.lower_limit) {
                const error = document.createElement('div')
                error.id = 'xmrtoolow'
                error.classList.add('message-label')
                const btc_amount = parseFloat(ExchangeFunctions.currentRates.lower_limit)
                error.innerHTML = `You cannot exchange less than ${btc_amount} BTC.`
                validationMessages.appendChild(error)
              }
              XMRcurrencyInput.value = XMRtoReceive.toFixed(12)
            }).catch((error) => {
              const errorDiv = document.createElement('div')
              errorDiv.classList.add('message-label')
              errorDiv.id = 'server-invalid'
              errorDiv.innerHTML = 'There was a problem communicating with the server. <br>If this problem keeps occurring, please contact support with a screenshot of the following error: <br>' + error.message
              serverValidation.appendChild(errorDiv)
            })
        }, 1500)
      }

      const xmrBalanceChecks = function () {
        serverValidation.innerHTML = ''
        let BTCToReceive
        const XMRbalance = parseFloat(XMRcurrencyInput.value)
        const in_amount = XMRbalance.toFixed(12)
        BTCcurrencyInput.value = 'Loading...'
        if (currencyInputTimer !== undefined) {
          clearTimeout(currencyInputTimer)
        }
        if (ExchangeFunctions.currentRates.in_min > XMRbalance) {
          const error = document.createElement('div')
          error.classList.add('message-label')
          error.id = 'xmrexceeded'
          error.innerHTML = `You cannot exchange less than ${ExchangeFunctions.currentRates.in_min} XMR`
          validationMessages.appendChild(error)
          return
        }
        if (ExchangeFunctions.currentRates.in_max < XMRbalance) {
          const error = document.createElement('div')
          error.classList.add('message-label')
          error.id = 'xmrexceeded'
          error.innerHTML = `You cannot exchange more than ${ExchangeFunctions.currentRates.in_max} XMR`
          validationMessages.appendChild(error)
          return
        }
        validationMessages.innerHTML = ''
        serverValidation.innerHTML = ''
        currencyInputTimer = setTimeout(() => {
          ExchangeFunctions.getOfferWithInAmount(ExchangeFunctions.in_currency, ExchangeFunctions.out_currency, in_amount)
            .then((response) => {
              console.log('async return', response)
              BTCToReceive = parseFloat(response.out_amount)
              const selectedWallet = document.getElementById('selected-wallet')
              const tx_feeElem = document.getElementById('tx-fee')
              const tx_fee = tx_feeElem.dataset.txFee
              const tx_fee_double = parseFloat(tx_fee)
              const walletMaxSpendDouble = parseFloat(selectedWallet.dataset.walletbalance)
              const walletMaxSpend = walletMaxSpendDouble - tx_fee

              if ((walletMaxSpend - XMRbalance) < 0) {
                const error = document.createElement('div')
                error.classList.add('message-label')
                error.id = 'xmrexceeded'
                error.innerHTML = `You cannot exchange more than ${walletMaxSpend} XMR`
                validationMessages.appendChild(error)
              }
              if (BTCToReceive.toFixed(8) > ExchangeFunctions.currentRates.out_max) {
                const error = document.createElement('div')
                error.classList.add('message-label')
                error.id = 'xmrexceeded'
                error.innerHTML = `You cannot exchange more than ${ExchangeFunctions.currentRates.in_max.toFixed(12)} XMR`
                validationMessages.appendChild(error)
              }
              if (BTCToReceive.toFixed(8) < ExchangeFunctions.currentRates.lower_limit) {
                const error = document.createElement('div')
                error.classList.add('message-label')
                error.id = 'xmrtoolow'
                error.innerHTML = `You cannot exchange less than ${ExchangeFunctions.currentRates.in_min.toFixed(12)} XMR.`
                validationMessages.appendChild(error)
              }
              BTCcurrencyInput.value = BTCToReceive.toFixed(8)
            }).catch((error) => {
              const errorDiv = document.createElement('div')
              errorDiv.classList.add('message-label')
              errorDiv.id = 'server-invalid'
              errorDiv.innerHTML = 'There was a problem communicating with the server. <br>If this problem keeps occurring, please contact support with a screenshot of the following error: <br>' + error.message
              serverValidation.appendChild(errorDiv)
            })
        }, 1500)
      }

      function getRates () {
        serverRatesValidation.innerHTML = ''
        const retry = document.getElementById('retry-rates')
        const errorDiv = document.getElementById('retry-error')
        if (retry !== null) {
          retry.classList.add('hidden')
          errorDiv.classList.add('hidden')
        }
        ExchangeFunctions.getRatesAndLimits().then(() => {
          loaderPage.classList.remove('active')
          exchangePage.classList.add('active')
        }).catch((error) => {
          if (retry !== null) {
            retry.classList.remove('hidden')
            errorDiv.classList.remove('hidden')
          } else {
            // KB: Remove this ---

            // end remove

            const errorDiv = document.createElement('div')
            errorDiv.innerText = "There was a problem with retrieving rates from the server. Please click the 'Retry' button to try connect again. The error message was: " + error.message
            errorDiv.id = 'retry-error'
            errorDiv.classList.add('message-label')
            const retryBtn = document.createElement('div')
            retryBtn.id = 'retry-rates'
            retryBtn.classList.add('base-button')
            retryBtn.classList.add('hoverable-cell')
            retryBtn.classList.add('navigation-blue-button-enabled')
            retryBtn.classList.add('action')
            retryBtn.innerHTML = 'Retry'
            retryBtn.addEventListener('click', getRates)
            explanatoryMessage.appendChild(errorDiv)
            explanatoryMessage.appendChild(retryBtn)
          }
        }).finally(() => {
          ExchangeFunctions.initialiseExchangeConfiguration().then((response) => {
            // Data returned by resolve
            const localmoneroDiv = document.getElementById('localmonero')
            const localmoneroAnchor = document.getElementById('localmonero-anchor')
            // let indacoinAnchor = document.getElementById('indacoin-anchor');

            // indacoinAnchor.setAttribute("url", "https://indacoin.com/");
            // indacoinAnchor.setAttribute("referrer_id", response.referrer_info.indacoin.referrer_id)
            // indacoinAnchor.setAttribute("param_str", "");
            localmoneroAnchor.setAttribute('referrer_id', response.data.referrer_info.localmonero.referrer_id)
            localmoneroAnchor.setAttribute('url', 'https://localmonero.co')
            localmoneroAnchor.setAttribute('param_str', 'rc')

            // if (response.referrer_info.indacoin.enabled === true) {
            //     indacoinDiv.style.display = "block";
            //     indacoinAnchor.addEventListener('click', openClickableLink);
            // }
            if (response.data.referrer_info.localmonero.enabled === true) {
              localmoneroDiv.style.display = 'block'
              localmoneroAnchor.addEventListener('click', openClickableLink)
            }
          }).catch(error => {
            const localmoneroDiv = document.getElementById('localmonero')
            const localmoneroAnchor = document.getElementById('localmonero-anchor')

            localmoneroAnchor.setAttribute('referrer_id', 'h2t1')
            localmoneroAnchor.setAttribute('url', 'https://localmonero.co')
            localmoneroAnchor.setAttribute('param_str', 'rc')
            // No data received from promise resolve(). Display link for LocalMonero
            localmoneroDiv.style.display = 'block'
            localmoneroAnchor.addEventListener('click', openClickableLink)
          })
        })
      }

      function renderOrderStatus (order) {
        /*

        "btc_amount",
        "btc_amount_partial",
        "btc_dest_address",
        "btc_num_confirmations_threshold",
        "created_at",
        "in_amount_remaining",
        "out_amount",
        "status",
        "expires_at",
        "incoming_amount_total",
        "incoming_num_confirmations_remaining",
        "incoming_price_btc",
        "receiving_subaddress",
        "recommended_mixin",
        "remaining_amount_incoming",
        "seconds_till_timeout",
        "state",
        "uses_lightning",
        "uuid"
        "provider_order_id"

*/

        const idArr = [
          'in_amount_remaining',
          'out_amount',
          'status',
          'expires_at',
          'provider_order_id',
          'in_address',
          'in_amount'
        ]

        const test = document.getElementById('exchangePage')
        if (!(test == null)) {
          idArr.forEach((item, index) => {
            if (item == 'in_address') {
              document.getElementById('receiving_subaddress').innerHTML = order[item]
            } else {
              document.getElementById(item).innerHTML = order[item]
            }
          })
        }
      }

      function getTimeRemaining (endtime) {
        const total = Date.parse(endtime) - Date.parse(new Date())
        let seconds = Math.floor((total / 1000) % 60)
        let minutes = Math.floor((total / 1000 / 60) % 60)
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
        const days = Math.floor(total / (1000 * 60 * 60 * 24))

        if (total < 0) {
          seconds = 0
          minutes = 0
        }

        return {
          total,
          days,
          hours,
          minutes,
          seconds
        }
      }

      function checkDecimals (value, decimals) {
        const str = value.toString()
        const strArr = str.split('.')
        if (strArr.length > 1) {
          if (strArr[1].length >= decimals) {
            return false
          }
        }
        return true
      }

      function openClickableLink () {
        const self = this
        const referrer_id = self.getAttribute('referrer_id')
        const url = self.getAttribute('url')
        const paramStr = self.getAttribute('param_str')
        if (referrer_id.length > 0) {
          console.log('Got a referrer -- generate custom URL')
          const urlToOpen = url + '?' + paramStr + '=' + referrer_id
          window.open(urlToOpen)
        } else {
          console.log('No referrer')
          window.open('https://localmonero.co')
        }
      }

      function isValidBase10Decimal (number) {
        const str = number.toString()
        const strArr = str.split('.')
        if (strArr.size > 1 && typeof (strArr) === Array) {
          return false
        }
        for (let i = 0; i < 2; i++) {
          if (isNaN(parseInt(strArr[i]))) {
            return false
          }
        }
        if (strArr.size > 1) {
          if (strArr[1].length == 0) {
            return false
          }
        }
        return true
      }

      function orderBtnClicked () {
        let validationError = false
        serverValidation.innerHTML = ''
        if (orderStarted == true) {
          return
        }
        if (validationMessages.firstChild !== null) {
          validationMessages.firstChild.style.color = '#ff0000'
          validationError = true
          return
        }
        if (addressValidation.firstChild !== null) {
          addressValidation.firstChild.style.color = '#ff0000'
          validationError = true
          return
        }
        const btc_dest_address = document.getElementById('btcAddress').value
        let firstTick = true
        orderBtn.style.display = 'none'
        orderStarted = true
        // backBtn.style.display = "block";
        loaderPage.classList.add('active')
        let orderStatusResponse = { orderTick: 0 }
        const out_amount = document.getElementById('BTCcurrencyInput').value
        const in_currency = 'XMR'
        const out_currency = 'BTC'
        try {
          const offer = ExchangeFunctions.getOfferWithOutAmount(in_currency, out_currency, out_amount).then((response) => {

          }).then((error, response) => {
            const selectedWallet = document.getElementById('selected-wallet')

            ExchangeFunctions.createOrder(btc_dest_address, selectedWallet.dataset.walletpublicaddress).then((response) => {
              document.getElementById('orderStatusPage').classList.remove('active')
              loaderPage.classList.remove('active')
              orderStatusDiv.classList.add('active')
              exchangeXmrDiv.classList.add('active')
              // backBtn.innerHTML = `<div class="base-button hoverable-cell utility grey-menu-button disableable left-back-button" style="cursor: default; -webkit-app-region: no-drag; position: absolute; opacity: 1; left: 0px;"></div>`;
              orderTimer = setInterval(() => {
                if (orderStatusResponse.hasOwnProperty('expires_at')) {
                  orderStatusResponse.orderTick++
                  renderOrderStatus(orderStatusResponse)
                  const expiryTime = orderStatusResponse.expires_at
                  const secondsElement = document.getElementById('secondsRemaining')
                  const minutesElement = document.getElementById('minutesRemaining')
                  if (secondsElement !== null) {
                    const minutesElement = document.getElementById('minutesRemaining')
                    const timeRemaining = getTimeRemaining(expiryTime)
                    minutesElement.innerHTML = timeRemaining.minutes
                    if (timeRemaining.seconds <= 9) {
                      timeRemaining.seconds = '0' + timeRemaining.seconds
                    }
                    secondsElement.innerHTML = timeRemaining.seconds
                    const xmr_dest_address_elem = document.getElementById('in_address')
                    xmr_dest_address_elem.value = response.receiving_subaddress
                  }

                  if (orderStatusResponse.status == 'PAID' || orderStatusResponse.status == 'TIMED_OUT' ||
                                orderStatusResponse.status == 'DONE' || orderStatusResponse.status == 'FLAGGED_DESTINATION_ADDRESS' ||
                                orderStatusResponse.status == 'PAYMENT_FAILED' || orderStatusResponse.status == 'REJECTED' ||
                                orderStatusResponse.status == 'EXPIRED') {
                    clearInterval(localOrderTimer)
                  }
                }
                if ((orderStatusResponse.orderTick % 10) == 0) {
                  ExchangeFunctions.getOrderStatus().then(function (response) {
                    const elemArr = document.getElementsByClassName('provider-name')
                    if (firstTick == true || elemArr[0].innerHTML == 'undefined') {
                      renderOrderStatus(response)
                      elemArr[0].innerHTML = response.provider_name
                      elemArr[1].innerHTML = response.provider_name
                      elemArr[2].innerHTML = response.provider_name

                      firstTick = false
                    }
                    let orderTick = orderStatusResponse.orderTick
                    orderTick++
                    response.orderTick = orderTick
                    orderStatusResponse = response
                  })
                }
              }, 1000)
              document.getElementById('orderStatusPage').classList.remove('active')
            }).catch((error) => {
              const errorDiv = document.createElement('div')
              errorDiv.classList.add('message-label')
              errorDiv.id = 'server-invalid'
              errorDiv.innerHTML = 'There was a problem communicating with the server. <br>If this problem keeps occurring, please contact support with a screenshot of the following error: <br>' + error
              serverValidation.appendChild(errorDiv)
              orderBtn.style.display = 'block'
              orderStarted = false
            })
          }).catch((error) => {
            const errorDiv = document.createElement('div')
            errorDiv.classList.add('message-label')
            errorDiv.id = 'server-invalid'
            errorDiv.innerHTML = 'There was a problem communicating with the server. <br>If this problem keeps occurring, please contact support with a screenshot of the following error: <br>' + error
            serverValidation.appendChild(errorDiv)
            orderBtn.style.display = 'block'
            orderStarted = false
          })
        } catch (Error) {
          console.log(Error)
        }
      }
      const exchangeRendered = document.getElementById('orderStatusPage')
      if (exchangeRendered == null) {

      } else {
        btcAddressInput.addEventListener('input', BTCAddressInputListener)
        XMRcurrencyInput.addEventListener('keydown', XMRCurrencyInputKeydownListener)
        BTCcurrencyInput.addEventListener('keydown', BTCCurrencyInputKeydownListener)
        orderBtn.addEventListener('click', orderBtnClicked)

        BTCcurrencyInput.addEventListener('keyup', function (event) {
          validationMessages.innerHTML = ''
          if (BTCcurrencyInput.value.length > 0) {
            btcBalanceChecks()
          }
        })

        XMRcurrencyInput.addEventListener('keyup', function (event) {
          validationMessages.innerHTML = ''
          if (XMRcurrencyInput.value.length > 0) {
            xmrBalanceChecks()
          }
        })
        getRates()
        clearInterval(exchangeInitTimer)
        initialized = true
      }
    }, 5000)
  }

  Balance_JSBigInt (wallet) {
    const self = this
    let total_received = wallet.total_received
    let total_sent = wallet.total_sent
    if (typeof total_received === 'undefined') {
      total_received = new JSBigInt(0) // patch up to avoid crash as this doesn't need to be fatal
    }
    if (typeof total_sent === 'undefined') {
      total_sent = new JSBigInt(0) // patch up to avoid crash as this doesn't need to be fatal
    }
    const balance_JSBigInt = total_received.subtract(total_sent)
    if (balance_JSBigInt.compare(0) < 0) {
      return new JSBigInt(0)
    }
    return balance_JSBigInt
  }

  UnlockedBalance_FormattedString (wallet) { // provided for convenience mainly so consumers don't have to require monero_utils
    const self = this
    const balance_JSBigInt = self.UnlockedBalance_JSBigInt(wallet)
    return monero_amount_format_utils.formatMoney(balance_JSBigInt)
  }

  Balance_FormattedString (wallet) { // provided for convenience mainly so consumers don't have to require monero_utils
    const self = this
    const balance_JSBigInt = self.Balance_JSBigInt(wallet)
    return monero_amount_format_utils.formatMoney(balance_JSBigInt)
  }

  Balance_DoubleNumber (wallet) {
    const self = wallet
    return parseFloat(self.Balance_FormattedString()) // is this appropriate and safe?
  }

  UnlockedBalance_JSBigInt (wallet) {
    const self = wallet
    const difference = self.Balance_JSBigInt().subtract(
      self.locked_balance || new JSBigInt(0)
    )
    if (difference.compare(0) < 0) {
      return new JSBigInt(0)
    }
    return difference
  }

  LockedBalance_JSBigInt (wallet) {
    const self = wallet
    let lockedBalance_JSBigInt = self.locked_balance
    if (typeof lockedBalance_JSBigInt === 'undefined') {
      lockedBalance_JSBigInt = new JSBigInt(0)
    }
    //
    return lockedBalance_JSBigInt
  }

  LockedBalance_FormattedString () { // provided for convenience mainly so consumers don't have to require monero_utils
    const self = this
    const lockedBalance_JSBigInt = self.LockedBalance_JSBigInt()
    //
    return monero_amount_format_utils.formatMoney(lockedBalance_JSBigInt)
  }

  LockedBalance_DoubleNumber () {
    const self = this
    return parseFloat(self.LockedBalance_FormattedString()) // is this appropriate and safe?
  }

  new_xmr_estFeeAmount () {
    const self = this
    const estimatedNetworkFee_JSBigInt = new JSBigInt(self.context.monero_utils.estimated_tx_network_fee(
      null, // deprecated - will be removed soon
      1,
      '24658' // TODO: grab this from wallet via API request
    ))
    const estimatedTotalFee_JSBigInt = estimatedNetworkFee_JSBigInt // no tx hosting service fee
    //
    return estimatedTotalFee_JSBigInt
  }

  _new_estimatedNetworkFee_displayString () {
    const self = this
    const estimatedTotalFee_JSBigInt = self.new_xmr_estFeeAmount()
    const estimatedTotalFee_str = monero_amount_format_utils.formatMoney(estimatedTotalFee_JSBigInt)
    const estimatedTotalFee_moneroAmountDouble = parseFloat(estimatedTotalFee_str)

    // const estimatedTotalFee_moneroAmountDouble = 0.028
    // Just hard-coding this to a reasonable estimate for now as the fee estimator algo uses the median blocksize which results in an estimate about twice what it should be
    const displayCcySymbol = self.context.settingsController.displayCcySymbol
    const finalizable_ccySymbol = displayCcySymbol
    const finalizable_formattedAmountString = estimatedTotalFee_str// `${estimatedTotalFee_moneroAmountDouble}`
    const final_formattedAmountString = finalizable_formattedAmountString
    const final_ccySymbol = 'XMR'
    const displayString = `${final_formattedAmountString}`
    //
    return displayString
  }

  Navigation_Title () {
    return 'Exchange'
  }

  Navigation_New_RightBarButtonView () {
    const self = this
    //
    const view = commonComponents_navigationBarButtons.New_RightSide_AddButtonView(self.context)
    // const view = _New_ButtonBase_View(context)
    const layer = view.layer
    { // setup/style
      layer.href = '' // to make it non-clickable -- KB: Or you could event.preventDefault..., like sane people?
      layer.innerHTML = 'Create Order'
      layer.id = 'order-button'
      layer.classList.add('exchange-button')
      layer.classList.add('base-button')
      layer.classList.add('hoverable-cell')
      layer.classList.add('navigation-blue-button-enabled')
      layer.classList.add('action')
      if (typeof process !== 'undefined' && process.platform === 'linux') {
        layer.style.fontWeight = '700' // surprisingly does not render well w/o this… not linux thing but font size thing. would be nice to know which font it uses and toggle accordingly. platform is best guess for now
      } else {
        layer.style.fontWeight = '300'
      }
    }

    // view.layer.addEventListener(
    //     "click",
    //     function(e)
    //     {
    //         e.preventDefault()
    //         //
    //         let orderElement = document.getElementById("")
    //         //
    //         // const view = new AddContactFromContactsTabView({}, self.context)
    //         // self.currentlyPresented_AddContactView = view
    //         // const navigationView = new StackAndModalNavigationView({}, self.context)
    //         // navigationView.SetStackViews([ view ])
    //         // self.navigationController.PresentView(navigationView, true)
    //         //
    //         return false
    //     }
    // )
    return view
  }
}

module.exports = ExchangeContentView
