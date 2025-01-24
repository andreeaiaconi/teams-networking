// "import { debounce } from "lodash";" is to import the whole lodash library
// this only imports the debounce file instead of the whole lodash library, to take up less space
import debounce from "lodash/debounce";
import "./style.css";
import { $, mask, unmask } from "./utilities";
import { loadTeamsRequest, createTeamRequest, updateTeamRequest, deleteTeamRequest } from "./middleware";

// global variables 
//  undefined variable
let editId;
//  this value will be updated to another value every time
let allTeams = [];

const formSelector = "#teamsForm"; 

// pure function
//  gets team as a json object and returns it as a string
function getTeamAsHTML({ id, promotion, members, name, url }) {
  const displayUrl = url.startsWith("https://github.com/") ? url.substring(19) : url;
  return `<tr>
    <td class "select-row">
      <input type="checkbox" name="selected" value="${id}" />
    </td>
    <td>${promotion}</td>
    <td>${members}</td>
    <td>${name}</td>
    <td>
      <a href="${url}" target="_blank">${displayUrl}</a>
    </td>
    <td>
      <button type="button" data-id="${id}" class="action-btn edit-btn">&#9998;</button>
      <button type="button" data-id="${id}" class="action-btn delete-btn">🗑️</button>
    </td>
    </tr>`;
}
function areTeamsEqual(renderedTeams, teams) {
  if (renderedTeams === teams) {
    return true;
  }
  if (renderedTeams.length === teams.length) {
    const eq = renderedTeams.every((team, i) => team === teams[i]);
    if (eq) {
      return true;
    }
  }
  return false;
}

let renderedTeams = [];
// function to map values and inject them into the html
function renderTeams(teams) {
  if (areTeamsEqual(renderedTeams, teams)) {
    return;
  }
  renderedTeams = teams;
  const teamsHtml = teams.map(getTeamAsHTML);

  $("#teamsTable tbody").innerHTML = teamsHtml.join("");
}

async function loadTeams() {
  const teams = await loadTeamsRequest();

  allTeams = teams;
  renderTeams(teams);
}

function updateTeam(teams, team) {
  return teams.map(t => {
    if (t.is === team.id) {
      return {
        ...t,
        ...team
      };
    }
    return t;
  });
}

// function to submit the form
async function onSubmit(e) {
  //   Prevents the default form submission behavior (i.e., stops the page
  // from reloading when the form is submitted)
  e.preventDefault();

  mask(formSelector);
  const team = getTeamValues();
  
  if (editId) {
    team.id = editId;

    const status = await updateTeamRequest(team);
    if (status.success) {
      allTeams = updateTeam(allTeams, team);
      renderTeams(allTeams);
      $("#teamsForm").reset();
    }
    unmask(formSelector);
  } else {
    // chaining
    createTeamRequest(team).then(status => {
      if (status.success) {
        team.id = status.id;
        // this adds the new team at the end of the list of all teams (at the bottom of the table)
        allTeams = [...allTeams, team];
        renderTeams(allTeams);
        $("#teamsForm").reset();
      }
      mask(formSelector);
    });
  }
}

function startEdit(id) {
  editId = id;
  const team = allTeams.find(team => team.id === id);
  setTeamValues(team);
}

function setTeamValues({ promotion, members, name, url }) {
  $("input[name=promotion]").value = promotion;
  $("input[name=members]").value = members;
  $("input[name=name]").value = name;
  $("input[name=url]").value = url;
}

function getTeamValues() {
  const promotion = $("input[name=promotion]").value;
  const members = $("input[name=members]").value;
  const name = $("input[name=name]").value;
  const url = $("input[name=url]").value;
  return {
    promotion: promotion,
    members: members,
    name: name,
    url: url
  };
}

function filterElements(teams, search) {
  search = search.toLowerCase();
  return teams.filter(({ promotion, members, name, url }) => {
    return (
      promotion.toLowerCase().includes(search) ||
      members.toLowerCase().includes(search) ||
      name.toLowerCase().includes(search) ||
      url.toLowerCase().includes(search)
    );
  });
}

async function removeSelected() {
  // because mask is the id of the section we're working on from html
  mask("#main");

  const selected = document.querySelectorAll("input[name=selected]:checked");
  const ids = [...selected].map(input => input.value);
  const promises = ids.map(id => deleteTeamRequest(id)); 
  const statuses = await Promise.allSettled(promises); 
  await loadTeams(); 
  unmask("#main");
}

function initEvents() {
  $("#removeSelected").addEventListener("click", removeSelected);
  $("#search").addEventListener(
    "input",
    debounce(e => {
      const search = e.target.value;
      // getting teams that match the search
      const teams = filterElements(allTeams, search);
      renderTeams(teams);
    }, 200)
  );
   $("#selectAll").addEventListener("input", e => {
    document.querySelectorAll("input[name=selected]").forEach(check => {
      check.checked = e.target.checked;
    }) ; 
   });

  // select the element's id and add an event to it
  $("#teamsForm").addEventListener("submit", onSubmit);
  $("#teamsForm").addEventListener("reset", () => {
    editId = undefined;
  });

  $("#teamsTable tbody").addEventListener("click", e => {
    if (e.target.matches("button.delete-btn")) {
      // const id = e.target.dataset.id;
      const { id } = e.target.dataset;
      mask(formSelector);
      deleteTeamRequest(id).then(status => {
        if (status.success) {
          allTeams = allTeams.filter(team => team.id !== id);
          renderTeams(allTeams);
        }
        unmask(formSelector);
      });
    } else if (e.target.matches("button.edit-btn")) {
      const { id } = e.target.dataset;
      startEdit(id);
    }
  });
}
// calling the functions
initEvents();

mask(formSelector);

mask(formSelector);
loadTeams().then(() => {
  unmask("#teamsForm");
});