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
const View = require('../Views/View.web')
//
const margin_side = 14
//
function New_EmptyStateMessageContainerView(emoji, messageText, context)
{
	const view = new View({}, context)
	{
		view.__EmptyStateMessageContainerView_margin_side = margin_side
	}
	{
		const layer = view.layer
		layer.style.position = "relative"
		layer.style.display = "table" // for vertical align
		layer.style.height = `calc(100% - ${2 * margin_side}px - 2px)` // -2px for border
		layer.style.width = `calc(100% - ${2 * margin_side}px - 2px)` // -2px for border
		layer.style.margin = "14px"
		layer.style.border = "1px solid #373537"
		layer.style.borderRadius = "5px"
	}
	var contentContainerLayer;
	{
		const layer = document.createElement("div")
		layer.style.display = "table-cell"
		layer.style.verticalAlign = "middle"
	    layer.style.transform = "translateY(-20px)" // pull everything up per design
		
		contentContainerLayer = layer
		view.layer.appendChild(layer)
	}
	{ // emoji
		const layer = document.createElement("div")
		layer.innerHTML = emoji
		layer.style.margin = "0 0 18px 0"
		layer.style.width = "100%"
		layer.style.height = "26px"
		layer.style.fontSize = "16px"
		layer.style.textAlign = "center"
		contentContainerLayer.appendChild(layer)
	}
	{ // message
		const layer = document.createElement("div")
		layer.innerHTML = messageText
		layer.style.margin = "0 0 0 0"
		layer.style.width = "100%"
		layer.style.height = "auto"
		layer.style.fontSize = "13px"
		layer.style.lineHeight = "16px"
		layer.style.fontFamily = context.themeController.FontFamily_sansSerif()
		layer.style.color = "#9D9B9D"
		layer.style.textAlign = "center"
		contentContainerLayer.appendChild(layer)
	}
	return view
}
exports.New_EmptyStateMessageContainerView = New_EmptyStateMessageContainerView