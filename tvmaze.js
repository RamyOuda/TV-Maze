"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");

async function getShowsByTerm() {
  const $term = $(`#search-query`).val();

  const search = await axios.get(
    `http://api.tvmaze.com/search/shows?q=${$term}`
  );

  $(`#search-query`).val(``);

  const shows = [];

  for (let i = 0; i < search.data.length; i++) {
    const show = search.data[i].show;

    if (show.image) {
      shows.push({
        id: show.id,
        name: show.name,
        summary: show.summary,
        image: show.image.medium,
      });
    } else {
      shows.push({
        id: show.id,
        name: show.name,
        summary: show.summary,
        image: `https://tinyurl.com/tv-missing`,
      });
    }
  }
  return shows;
}

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show mb-4 col-xl-5 p-5 m-3 card">
         <div class="media">
           <img 
              src=${show.image} 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-primary btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
    );
    $showsList.append($show);
  }
}

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

async function getEpisodesOfShow(id) {
  const episodes = await axios.get(
    `http://api.tvmaze.com/shows/${id}/episodes`
  );

  return episodes.data.map((e) => ({
    id: e.id,
    name: e.name,
    season: e.season,
    number: e.number,
  }));
}

function populateEpisodes(episodes) {
  $(`ul`).empty();

  for (let episode of episodes) {
    const $item = $(
      `<li>
           ${episode.name}
           (season ${episode.season}, episode ${episode.number})
         </li>
        `
    );

    $(`ul`).append($item);
  }
  $episodesArea.show();
}

async function getEpisodesAndDisplay(evt) {
  const showId = $(evt.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);
