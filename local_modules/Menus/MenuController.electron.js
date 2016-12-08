// Copyright (c) 2014-2017, MyMonero.com
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
//	conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//	of conditions and the following disclaimer in the documentation and/or other
//	materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//	used to endorse or promote products derived from this software without specific
//	prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
"use strict"
//
const {Menu} = require('electron')
//
class MenuController
{
	constructor(options, context)
	{
		const self = this
		self.options = options
		self.context = context
		//
		self.setup()
	}
	setup()
	{
		const self = this
		self.setup_menu()
	}
	setup_menu()
	{
		const self = this
		const menuSpecs = self._new_menuSpecs()
		const menu = Menu.buildFromTemplate(menuSpecs)
		self.menu = menu
		{
			const app = self.context.app
			function _setMenu()
			{
				Menu.setApplicationMenu(menu)
			}
			if (app.isReady()) {
				_setMenu()
			} else {
				app.on('ready', _setMenu)
			}
		}
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors
	
	_new_menuSpecs()
	{
		const self = this
		const electron_shell = require('electron').shell
		const isMacOS = process.platform === 'darwin'
		const appName = self.context.app.getName()
		//
		const menuSpecs = []
		if (isMacOS === true) {
			menuSpecs.push({
				label: appName,
				submenu: [
					{
						role: 'about'
					},
					{
						type: 'separator'
					},
					{
						role: 'services',
						submenu: []
					},
					{
						type: 'separator'
					},
					{
						role: 'hide'
					},
					{
						role: 'hideothers'
					},
					{
						role: 'unhide'
					},
					{
						type: 'separator'
					},
					{
						role: 'quit'
					}
				]
			})
		}
		{ // Edit
			const submenu = 
			[
				{
					role: 'undo'
				},
				{
					role: 'redo'
				},
				{
					type: 'separator'
				},
				{
					role: 'cut'
				},
				{
					role: 'copy'
				},
				{
					role: 'paste'
				},
				{
					role: 'pasteandmatchstyle'
				},
				{
					role: 'delete'
				},
				{
					role: 'selectall'
				}
			]
			if (isMacOS === true) {
				submenu.push(
					{
						type: 'separator'
					},
					{
						label: 'Speech',
						submenu: [
							{
								role: 'startspeaking'
							},
							{
								role: 'stopspeaking'
							}
						]
					}
				)
			}			
			//
			const menuSpec = 
			{
				label: 'Edit',
				submenu: submenu
			}
			menuSpecs.push(menuSpec)
		}
		// menuSpecs.push({
		// 	label: 'View',
		// 	submenu: [
		// 		{
		// 			role: 'reload'
		// 		},
		// 		{
		// 			type: 'separator'
		// 		},
		// 	]
		// })
		{ // Window menu
			const menuSpec = 
			{
				role: 'window'
			}
			if (isMacOS === true) {
				menuSpec.submenu = 
				[
					{
						label: 'Close',
						accelerator: 'CmdOrCtrl+W',
						role: 'close'
					},
					{
						label: 'Minimize',
						accelerator: 'CmdOrCtrl+M',
						role: 'minimize'
					},
					{
						label: 'Zoom',
						role: 'zoom'
					},
					{
						type: 'separator'
					},
					{
						label: 'Bring All to Front',
						role: 'front'
					}
				]
			} else {
				menuSpec.submenu = 
				[
					{
						role: 'minimize'
					},
					{
						role: 'close'
					}
				]
			}
			menuSpecs.push(menuSpec)
		}
		{ // Help
			menuSpecs.push({
				role: 'help',
				submenu: [
					{
						label: 'MyMonero.com',
						click() { 
							electron_shell.openExternal('https://mymonero.com/')
						}
					},
					{
						role: 'separator'
					},
					{
						label: 'Support',
						click() {
							electron_shell.openExternal('https://mymonero.com/#/support')
						}
					},
					{
						role: 'separator'
					},
					{
						label: 'Privacy Policy',
						click() { 
							electron_shell.openExternal('https://mymonero.com/#/privacy-policy')
						}
					},
					{
						label: 'Terms of Use',
						click() { 
							electron_shell.openExternal('https://mymonero.com/#/terms')
						}
					}
				]
			})
		}
		//
		return menuSpecs
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives
	

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation
}
module.exports = MenuController