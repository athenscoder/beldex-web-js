'use strict'

const ListCustomSelectView = require('../../Lists/Views/ListCustomSelectView.web')
const WalletCellContentsView = require('../../Wallets/Views/WalletCellContentsView.web')
const commonComponents_walletIcons = require('../../MMAppUICommonComponents/walletIcons.web')

function _fromContext_wantsHoverAndSelectable (context) {
  if (context.isLiteApp == true) {
    return false // special case - b/c we'll only ever have max 1 wallet
  }
  return true
}
//
class WalletsSelectView extends ListCustomSelectView {
  // Lifecycle - Setup
  constructor (options, context) {
    options = options || {}
    options.cellView_height_fn = function (selectView, cellView) { // must implement this (currently) so the CustomSelectView can avoid asking cells for their offsetHeight
      return 66
    }
    options.listController = context.walletsListController // must pass
    options.cellContentsViewClass = WalletCellContentsView // must pass
    options.cellContentsView_init_baseOptions = // optl but set here for things like icon_sizeClass
		{
		  icon_sizeClass: commonComponents_walletIcons.SizeClasses.Medium32,
		  wantsHoverable: _fromContext_wantsHoverAndSelectable(context),
		  wantsNoSecondaryBalances: true,
		  wantsOnlySpendableBalance: true // this could be changed to false for e.g. the creatfundsrequestform
		}
    super(options, context)
  }

  overridable_wantsSelectionDisplayCellView_clickable () {
    return _fromContext_wantsHoverAndSelectable(this.context)
  }

  setup_views () {
    const self = this
    {
      const layer = self.layer
      layer.classList.add('WalletSelectView') // must add class for css rules
    }
    super.setup_views()
    {
      const layer = self.selectionDisplayCellView.layer
      layer.style.backgroundColor = 'none'
      if (self.context.Views_selectivelyEnableMobileRenderingOptimizations !== true) {
        layer.style.boxShadow = '0 0.5px 1px 0 #161416, inset 0 0.5px 0 0 #3dc343'
      } else { // avoiding shadow
        layer.style.boxShadow = 'inset 0 0.5px 0 0 #3dc343'
      }
    }
    {
      const layer = document.createElement('div')
      layer.style.position = 'absolute'
      layer.style.left = '0'
      layer.style.top = '0'
      layer.style.width = '100%'
      layer.style.height = '100%'
      layer.style.zIndex = '10' // below cells
      layer.className = 'background'
      self.options_containerView.layer.appendChild(layer)
    }
    if (self.context.isLiteApp == true) {
      self.disclosureArrowLayer.style.display = 'none'
    }
  }

  // Overrides
  overridable_maxNumberOfCellsToDisplayAtATime () { return 2.65 }
  overridable_setup_cellView (cellView, rowItem) {
    const self = this
    super.overridable_setup_cellView(cellView, rowItem)
    cellView.layer.backgroundColor = 'none' // so we can see the decoration around self.options_containerView/.bg
  }
}
module.exports = WalletsSelectView
