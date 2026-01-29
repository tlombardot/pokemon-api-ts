export class PaginationPokemon extends HTMLElement {
  public _offset: number = 0;
  private readonly _limit: number = 20;
  private _count: number = 1350;
  private _pages: number = 1;

  connectedCallback() {
    this.render();
    this.addListeners();
  }

  set dataCount(value: { count: number; offset: number }) {
    this._count = value.count;
    this._offset = value.offset;
    this._pages = Math.floor(this._offset / this._limit) + 1;
    this.render();
    this.addListeners();
  }

  private render() {
    this.innerHTML = `
                    <button id="btn-prev" class="bg-gray-700/70 text-white px-4 py-2 rounded-3xl hover:scale-110 active:scale-95 hover:bg-gray-600/70 disabled:opacity-10 disabled:hover:bg-gray700/70" ${this._offset === 0 ? "disabled" : ""}>
                        Précédent
                    </button>
                    <input id="input-page" min="1" value="${this._pages}" type="number" class ="w-20 text-center text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
                    <button id="btn-next" class="bg-blue-600/70 text-white px-4 py-2 rounded-3xl hover:scale-110 active:scale-95 hover:bg-blue-500/70 disabled:opacity-10 disabled:hover:bg-blue-600/70" ${this._offset + this._limit >= this._count ? "disabled" : ""}>
                        Suivant
                    </button>
       `;
  }

  private addListeners(): void {
    const next = this.querySelector("#btn-next");
    const prev = this.querySelector("#btn-prev");
    const page = this.querySelector("#input-page") as HTMLInputElement;
    next?.addEventListener("click", () => {
      this._offset += this._limit;
      this._pages = Number(this._offset / this._limit + 1);
      this.notifyChange();
      this.render();
      this.addListeners();
    });
    prev?.addEventListener("click", () => {
      this._offset -= this._limit;
      this._pages = Number(this._offset / this._limit + 1);
      this.notifyChange();
      this.render();
      this.addListeners();
    });
    page?.addEventListener("change", () => {
      this._pages = Number(page.value) || 1;
      if (this._pages > Math.round(this._count / this._limit))
        this._pages = Math.round(this._count / this._limit);
      this._offset = this._pages * this._limit - this._limit;
      this.notifyChange();
      this.render();
      this.addListeners();
    });
  }

  private notifyChange() {
    const event = new CustomEvent("page-changed", {
      detail: { offset: this._offset, limit: this._limit },
    });
    this.dispatchEvent(event);
  }
}

customElements.define("pagination-pokemon", PaginationPokemon);
