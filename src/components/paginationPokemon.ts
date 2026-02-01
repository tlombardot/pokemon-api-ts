import type { PokemonURL } from "../types/pokemon";

export class PaginationPokemon extends HTMLElement {
  public _offset: number = 0;
  public _limit: number = 20;
  private _total: number = 0;
  private _currentList: PokemonURL[] = [];

  set total(value: number) {
    this._total = value;
    this.render();
    this.addListeners();
  }

  set limit(value: number) {
    this._limit = value;
  }

  set currentList(value: PokemonURL[]) {
    this._currentList = value;
    this.total = value.length;
  }

  connectedCallback() {
    this.render();
    this.addListeners();
  }

  private render() {
    const currentPage = Math.floor(this._offset / this._limit) + 1;
    const maxPages = Math.ceil(this._total / this._limit) || 1;

    const btnStyle = "bg-[#f9f9f9] dark:bg-slate-700 border border-[#aaa] dark:border-slate-500 text-[#0645ad] dark:text-blue-300 px-3 py-1 text-sm font-bold hover:bg-white dark:hover:bg-slate-600 hover:border-[#666] dark:hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400 dark:disabled:text-gray-500 transition-colors cursor-pointer select-none";
    
    const inputStyle = "w-16 text-center border border-[#aaa] dark:border-slate-500 p-1 text-sm bg-white dark:bg-slate-900 text-black dark:text-white outline-none focus:border-[#0645ad] dark:focus:border-blue-400 transition-colors";

    this.innerHTML = /*html*/`
      <div class="flex items-center justify-center gap-2 font-sans p-2 bg-[#f0f0f0] dark:bg-slate-800 border border-[#ccc] dark:border-slate-600 rounded-sm shadow-sm transition-colors duration-300">
          
          <button id="btn-prev" class="${btnStyle}" ${this._offset === 0 ? "disabled" : ""}>
              &laquo; Précédent
          </button>

          <div class="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 mx-2">
              <span>Page</span>
              <input id="input-page" type="number" min="1" max="${maxPages}" value="${currentPage}" class="${inputStyle}">
              <span>sur ${maxPages}</span>
          </div>

          <button id="btn-next" class="${btnStyle}" ${this._offset + this._limit >= this._total ? "disabled" : ""}>
              Suivant &raquo;
          </button>

      </div>
    `;
  }

  private addListeners(): void {
    const next = this.querySelector("#btn-next");
    const prev = this.querySelector("#btn-prev");
    const pageInput = this.querySelector("#input-page") as HTMLInputElement;

    next?.addEventListener("click", () => {
      if (this._offset + this._limit < this._total) {
        this._offset += this._limit;
        this.notifyChange();
        this.render();
        this.addListeners();
      }
    });

    prev?.addEventListener("click", () => {
      if (this._offset > 0) {
        this._offset -= this._limit;
        this.notifyChange();
        this.render();
        this.addListeners();
      }
    });

    pageInput?.addEventListener("change", () => {
      let newPage = Number(pageInput.value);
      const maxPages = Math.ceil(this._total / this._limit) || 1;

      if (newPage < 1) newPage = 1;
      if (newPage > maxPages) newPage = maxPages;

      this._offset = (newPage - 1) * this._limit;
      
      this.notifyChange();
      this.render();
      this.addListeners();
    });
  }

  private notifyChange() {
    const event = new CustomEvent("page-changed", {
      detail: { 
          offset: this._offset, 
          limit: this._limit, 
          currentList: this._currentList 
      },
    });
    this.dispatchEvent(event);
  }
}

customElements.define("pagination-pokemon", PaginationPokemon);