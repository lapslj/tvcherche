"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  let tvArray = []
  let response = await axios.get("http://api.tvmaze.com/search/shows?",{
    params: {
      q: term
    }
  });
  console.log(response.data)
  for (let show of response.data){
    let zShow = {}
    zShow.id=show.show.id;
    zShow.name=show.show.name;
    zShow.summary=show.show.summary;
    try {zShow.image= show.show.image.original}catch(e){zShow.image= "https://tinyurl.com/tv-missing"};
    console.log(zShow)
    tvArray.push(zShow)
  }
  return tvArray

}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes" id="${show.id}-btn">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `)
      $showsList.append($show);
      $(`#${show.id}-btn`).on('click',function(){
        populateEpisodes(show.id)
      });
      // $(`#${show.id}-btn`).on('click',function(){
      //   console.log("you clicked"+show.id)
      // });
    }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) { 
  let epArray = []
  let response = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  console.log(response.data)
  for (let show of response.data){
    let zEp = {}
    zEp.id=show.id;
    zEp.name=show.name;
    zEp.season=show.season;
    zEp.number=show.number;
    console.log(zEp)
    epArray.push(zEp)
  }
  return epArray
}

/** Given an array of episodes, populate into #episodes-list part of DOM */

async function populateEpisodes(showId) {
  let rEps = await getEpisodesOfShow(showId)
  $episodesArea.attr("style","")
  for(let episode of rEps){
    let epElement = $("<li>").html(`${episode.name}`)
    $("#episodesList").append(epElement)
  }

}
