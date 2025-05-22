import { fetchRepos} from "./api";
import type { Repo, SortOption, ViewOption } from "./types";


let viewOption: ViewOption = "favorites"; 
let sortBy: SortOption = "updated";       
let searchRepos: Repo[] = [];   
let favoriteRepos: Repo[] = JSON.parse(localStorage.getItem("favorites") || "[]"); 


//Favorite Repos
const favoriteReposDiv = document.getElementById('favoriteReposDiv')! 
showRepos()

// Toggle Favorites
function toggleFavorite(id: number) {
  const repos = viewOption==='favorites'? favoriteRepos : searchRepos
  const repo = repos.find((r) => r.id === id);
  if (!repo) return
  repo.isFavorite=!repo.isFavorite
   if(!favoriteRepos.some(item=>item.id===id)) {  
        favoriteRepos.push(repo)
      }
    else{
        favoriteRepos = favoriteRepos.filter((favorite) => favorite.id !== repo.id);
      }
  
  localStorage.setItem("favorites", JSON.stringify(favoriteRepos));
  showRepos()
  }

  
//Search Projects
const searchInput = document.getElementById('searchInput')! as HTMLInputElement 
const searchReposDiv = document.getElementById('searchReposDiv')! 
let timer: number
searchInput.addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(async() =>{
    const project = searchInput.value
    if (!project) return;
    
    const result = await fetchRepos(project);
    searchRepos=result.items.map(item=>({
      ...item, 
      isFavorite: favoriteRepos.some(favorite=>favorite.id === item.id)
    }))
    if (!searchRepos || searchRepos.length === 0) {
        searchReposDiv.innerHTML = `<h1 class="text-gray-600">No results found</h1>`;
        return
    }
    showRepos()
  }, 1000)
 
});
const sorting = document.querySelector<HTMLDetailsElement>('#sorting');

window.addEventListener('click', (event) => {
  if (sorting && sorting.hasAttribute('open') && !sorting.contains(event.target as Node)) {
    sorting.removeAttribute('open'); // Close the modal
  }
});

//Open and Close Search Modal
const openSearch= document.getElementById("openSearch")!
const searchModalDiv= document.getElementById("searchModal")!
const closeSearch= document.getElementById("closeSearch")!
openSearch.addEventListener('click', ()=>{
  searchModalDiv.classList.remove('hidden');
  searchInput.focus()
  viewOption="search"
})
closeSearch.addEventListener('click', ()=>{
  searchModalDiv.classList.add('hidden')
  viewOption='favorites'
  searchRepos=[]
  searchReposDiv.innerHTML=""
  searchInput.value=""
  showRepos()
})

//Sort the Projects
const sortByStarsButton = document.getElementById('sortByStars')!
const sortByForksButton = document.getElementById('sortByForks')!
const sortByUpdatedButton = document.getElementById('sortByUpdated')!

sortByStarsButton.addEventListener('click', () => {
  sortBy = 'stars';
  sortRepos(sortBy)
});
sortByForksButton.addEventListener('click', () => {
  sortBy = 'forks';
  sortRepos(sortBy)
});
sortByUpdatedButton.addEventListener('click', () => {
  sortBy = 'updated';
  sortRepos(sortBy)
})

function sortRepos(sortBy:SortOption){
  let repos = viewOption === 'search' ? searchRepos : favoriteRepos;
  repos= repos.sort((a, b)=>{
    if(sortBy==='stars') return b.stargazers_count - a.stargazers_count
    else if(sortBy==='forks') return b.forks_count - a.forks_count
    else{
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
  })
  showRepos()
}

//Show Repos
function showRepos(){
  const div = viewOption==='search'? searchReposDiv : favoriteReposDiv
  const repos = viewOption==='search'? searchRepos : favoriteRepos
  if(viewOption==='favorites' && favoriteRepos.length===0)
  {
    div.innerHTML=`  <h4  class="text-4xl sm:text-6xl mt-20 sm:mt-28  text-center text-amber-700/50 font-bold" >No Favorites Yet</h4>`
    return
  }
    div.innerHTML = repos.map(item => 
      `<div class="sm:p-1 flex gap-6 items-start justify-between pb-3 text-pretty">
      <img src="${item.owner.avatar_url}" " class="rounded-full w-10 sm:w-12 md:w-14">
      <div class="w-full">
          <h3 class="font-bold text-zinc-900">
            <a href="${item.html_url}" target="_blank" class="hover:underline">
              ${item.name}
            </a>
          </h3>
          <p class='text-zinc-800 font-medium'>@${item.owner.login}</p>
          <p class='text-zinc-700'>${item.description}</p>
          <div class="flex gap-3 mt-2">
             <span class="flex items-center gap-0.5"><svg class="size-4 sm:size-5 fill-amber-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z"></path> </g></svg>${item.stargazers_count}</span>
  
            <span class="flex items-center"><svg class="size-4 sm:size-5 fill-amber-800" viewBox="-4 -1.5 24 24" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin" class="jam jam-fork-f"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M9.033 15.04A3.001 3.001 0 1 1 7 15.03v-1.047c0-.074.003-.148.008-.221a1 1 0 0 0-.462-.638L3.46 11.277A3 3 0 0 1 2 8.703V6.687a3.001 3.001 0 1 1 2 0v2.016a1 1 0 0 0 .487.858l3.086 1.846a3 3 0 0 1 .443.324 3 3 0 0 1 .444-.324l3.086-1.846a1 1 0 0 0 .487-.858V6.699A3.001 3.001 0 0 1 13 .858a3 3 0 0 1 1.033 5.817v2.028a3 3 0 0 1-1.46 2.574l-3.086 1.846a1 1 0 0 0-.462.638c.005.073.008.147.008.22v1.06z"></path></g></svg>${item.forks_count} </span>
            
            <span class="flex gap-0.5 items-center"> <svg class="size-4 sm:size-5 stroke-amber-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 9H21M7 3V5M17 3V5M6 13H8M6 17H8M11 13H13M11 17H13M16 13H18M16 17H18M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg> ${new Date(item.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
        <button class="cursor-pointer" title="Add Favorite" data-id="${item.id}">
          <svg class="size-4 sm:size-5  stroke-2  ${item.isFavorite? "fill-amber-700" : "stroke-amber-700 fill-none"}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M20.808,11.079C19.829,16.132,12,20.5,12,20.5s-7.829-4.368-8.808-9.421C2.227,6.1,5.066,3.5,8,3.5a4.444,4.444,0,0,1,4,2,4.444,4.444,0,0,1,4-2C18.934,3.5,21.773,6.1,20.808,11.079Z"></path></g></svg>
        </button>
      </div>
      `).join("");

      // Add favorite handlers
      document.querySelectorAll("[data-id]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = Number((e.currentTarget as HTMLElement).dataset.id);
          toggleFavorite(id);
        });
      });  
}


