const Components = (function(){
	this.customElements = null

	// elemets
	class WrtInlineIcon extends HTMLElement {
		constructor() {
			super();
		}
	
		connectedCallback() {
			const shadow = this.attachShadow({mode: 'open'});
			const headerId = this.getAttribute('headerId')
	
			const style = `
				.wrtcInlinIcon{
					border: 1px solid #e6e8e9;
					border-radius: 50%;
					background: #fff;
					box-shadow: 1px 1px 8px #e6e8e9;
					outline: none;
					width: 40px;
					height: 40px;
					transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
					display: flex;
					align-items: center;
					color: #333333;
					justify-content: center;
				}
				.wrtcInlinIcon.active svg{
					color: #2678ff;
				}
				.wrtcInlinIcon:hover{
					background-color: #2678ff;
					color: #fff;
				}
				.wrtcInlinIcon svg {
					width: 16px;
					height: 16px;
				}
				.wrtcInlinIcon.active .loader{
					display: block;
				}
				.wrtcInlinIcon .loader {
					border: 4px solid #f3f3f3;
					border-top: 4px solid #3498db;
					border-radius: 50%;
					animation: spin 2s linear infinite;
					padding: 16px;
					position: absolute;
					z-index: 2;
					background: transparent;
					left: -1px;
					top: -1px;
					display: none;
				}
	
				@keyframes spin {
					0% { transform: rotate(0deg); }
					100% { transform: rotate(360deg); }
				}
			`
	
			const content = `
				<button class="btn_roomHandler wrtcInlinIcon ${headerId}" data-action="JOIN" data-id="${headerId}"data-join="PLUS">
					<span class="loader"></span>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M336.2 64H47.8C21.4 64 0 85.4 0 111.8v288.4C0 426.6 21.4 448 47.8 448h288.4c26.4 0 47.8-21.4 47.8-47.8V111.8c0-26.4-21.4-47.8-47.8-47.8zm189.4 37.7L416 177.3v157.4l109.6 75.5c21.2 14.6 50.4-.3 50.4-25.8V127.5c0-25.4-29.1-40.4-50.4-25.8z"></path></svg>
				</button>
			`
	
			shadow.innerHTML = `
				<style>${style}</style>
				${content}
			`;
		}
	
	}
	

	// builder
	const innerComponent = () => {
		this.customElements.define('wrt-inline-icon', WrtInlineIcon);
	}

	const outterComponent = () => {}

	return (customElements) => {
		this.customElements = customElements
		innerComponent()
		outterComponent()
	}
})