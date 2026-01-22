
export class PaginationPokemon extends HTMLElement{

    public _offset:number = 0;
    private _limit:number = 20;
    private _count:number = 1350;

    connectedCallback() {
        this.render();
        this.addListeners()
    }



    private render(){
        console.log(this._count)
        this.innerHTML=`
                    <button id="btn-prev" class="bg-gray-700/70 text-white px-4 py-2 rounded-3xl hover:bg-gray-600/70 disabled:opacity-10 disabled:hover:bg-gray700/70" ${this._offset === 0 ? 'disabled' : ''}>
                        Précédent
                    </button>
                    <input id="input-page" type="number" class ="w-20 text-center text-white">
                    <button id="btn-next" class="bg-blue-600/70 text-white px-4 py-2 rounded-3xl hover:bg-blue-500/70 disabled:opacity-10 disabled:hover:bg-blue-600/70" ${this._offset + this._limit >= this._count ? 'disabled' : ''}>
                        Suivant
                    </button>
       `
   }

   private addListeners():void{
        const next = this.querySelector("#btn-next");
        const prev = this.querySelector("#btn-prev");
        next?.addEventListener("click", ()=>{
                this._offset += this._limit
                this.notifyChange()
                this.render()
                this.addListeners()
            })
       prev?.addEventListener("click", ()=>{
                this._offset -= this._limit
                this.notifyChange()
                this.render()
                this.addListeners()
            })
   }

    private notifyChange() {
        const event = new CustomEvent('page-changed', {
            detail: { offset: this._offset, limit: this._limit }
        });
        this.dispatchEvent(event);
    }
}

customElements.define('pagination-pokemon', PaginationPokemon);