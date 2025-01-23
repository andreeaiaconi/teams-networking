import "./style.css";

//  undefined variable
let editId;
//  this value will be updated to another value every time
//  we do a laod
let allTeams = [];


function $(selector) {
  return document.querySelector(selector);
}

function createTeamRequest(team) {
  return fetch("http://localhost:3000/teams-json/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  }).then(r => r.json());
}
function deleteTeamRequest(id) {
  return fetch("http://localhost:3000/teams-json/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id: id })
    // this "then" means: "when you finish the request
    // please call the function and give the result to
    //  the next one"
  }).then(r => r.json());
}

function updateTeamRequest(team) {
  // PUT teams-json/update
  return fetch("http://localhost:3000/teams-json/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  }).then(r => r.json());
}
// pure function
//  gets team as a json object and returns it as a string
function getTeamAsHTML(team) {
  const url = team.url;
  const displayUrl = url.startsWith("https://github.com/") ? url.substring(19): url
  return `<tr>
    <td>${team.promotion}</td>
    <td>${team.members}</td>
    <td>${team.name}</td>
    <td>
      <a href="${url}" target="_blank">${displayUrl}</a>
    </td>
    <td>
      <button type="button" data-id="${team.id}" class="action-btn edit-btn">&#9998;</button>
      <button type="button" data-id="${team.id}" class="action-btn delete-btn">🗑️</button>
    </td>
    </tr>`;
}
// function to map values and inject them into the html
function renderTeams(teams) {
  const teamsHtml = teams.map(getTeamAsHTML);

  $("#teamsTable tbody").innerHTML = teamsHtml.join("");
}
// fetching information from the teams.json file
function loadTeams() {
  // load json file
  fetch("http://localhost:3000/teams-json", {
    // getting values from this server
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
    // then wait for the json response
    .then(r => r.json())
    .then(teams => {
      allTeams = teams;
      renderTeams(teams);
      // stopping timer
      console.timeEnd("app-ready");
      //  then print value in console to see if the fetch was successful
      // console.warn("teams?", teams);
      // then actually print the value where you need it on the page
    });
}
// function to submit the form
function onSubmit(e) {
  //   Prevents the default form submission behavior (i.e., stops the page
  // from reloading when the form is submitted)
  e.preventDefault();

  const team = getTeamValues();

  if (editId) {
    team.id = editId;
    console.warn("should we edit?", editId, team);
    updateTeamRequest(team).then(status => {
      console.warn("status", status);
      if (status.success) {
        window.location.reload();
      }
    });
  } else {
    // chaining
    createTeamRequest(team).then(status => {
      console.warn("status", status, team);
      if (status.success) {
        team.id = status.id;
        allTeams.push(team);
        renderTeams(allTeams);
        $("#teamsForm").reset();
      }
    });
  }
}

function startEdit(id) {
  editId = id;
  const team = allTeams.find(team => team.id === id);
  console.warn("edit", id, team);
  setTeamValues(team);
}

function setTeamValues(team) {
  $("input[name=promotion]").value = team.promotion;
  $("input[name=members]").value = team.members;
  $("input[name=name]").value = team.name;
  $("input[name=url]").value = team.url;
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
  // console.warn("search %o", search);
  return teams.filter(team => {
    return (
      team.promotion.toLowerCase().includes(search) ||
      team.members.toLowerCase().includes(search) ||
      team.name.toLowerCase().includes(search) ||
      team.url.toLowerCase().includes(search)
    );
  });
}

function initEvents() {
  $("#search").addEventListener("input", e => {
    const search = e.target.value;
    // getting teams that match the search
    const teams = filterElements(allTeams, search);
    renderTeams(teams);
  });

  // select the element's id and add an event to it
  $("#teamsForm").addEventListener("submit", onSubmit);
  $("#teamsForm").addEventListener("reset", () => {
    console.warn("reset", editId);
    editId = undefined;
  });

  $("#teamsTable tbody").addEventListener("click", e => {
    if (e.target.matches("button.delete-btn")) {
      const id = e.target.dataset.id;
      deleteTeamRequest(id).then(status => {
        if (status.success) {
          allTeams = allTeams.filter(team => team.id !== id);
          renderTeams(allTeams);
        }
      });
    } else if (e.target.matches("button.edit-btn")) {
      const id = e.target.dataset.id;
      startEdit(id);
    }
  });
}
// calling the functions
initEvents();
loadTeams();
