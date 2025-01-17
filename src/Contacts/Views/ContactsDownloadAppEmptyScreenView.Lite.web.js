'use strict'
//
const View = require('../../Views/View.web')
const commonComponents_emptyScreens = require('../../MMAppUICommonComponents/emptyScreens.web')
//
class ContactsDownloadAppEmptyScreenView extends View {
  constructor (options, context) {
    super(options, context)
    //
    const self = this
    self.layer.style.width = '100%'
    self.layer.style.height = '100%'
    //
    const view = new View({}, self.context)
    const layer = view.layer
    const margin_side = 16
    const marginTop = 56
    layer.style.marginTop = `${marginTop}px`
    layer.style.marginLeft = margin_side + 'px'
    layer.style.width = `calc(100% - ${2 * margin_side}px)`
    layer.style.height = `calc(100% - ${marginTop}px - 15px)`
    //
    const emptyStateMessageContainerView = commonComponents_emptyScreens.New_EmptyStateMessageContainerView(
      '👇',
      "To create Contacts,<br/><a href= \"https://wallet.beldex.io\" target=\"_blank\" style='color: #11bbec; cursor: pointer; -webkit-user-select: none; text-decoration: none;'>download the app(coming soon)</a>.",
      self.context,
      0,
      0
    )
    view.addSubview(emptyStateMessageContainerView)
    self.addSubview(view)
  }

  //
  // Runtime - Accessors - Navigation
  Navigation_Title () {
    return 'Contacts'
  }
}
module.exports = ContactsDownloadAppEmptyScreenView
