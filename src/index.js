import "./style.css";

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
//  gets team as a json object and returns it as a string
function getTeamAsHTML(team) {
  return `<tr>
            <td>${team.promotion}</td>
            <td>${team.members}</td>
            <td>${team.name}</td>
            <td>${team.url}</td>
            <td>
              <button type="button" data-id="${team.id}" class="action-btn delete-btn">♻️</button>
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
      renderTeams(teams);
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
  const members = $("input[name=members]").value;
  const name = $("#name").value;
  const url = $("#url").value;
  const team = {
    promotion: $("input[name=promotion]").value,
    members: members,
    name: name,
    url: url
  };
  // chaining
  createTeamRequest(team).then(status => {
    //   console.warn("status", status);
    if (status.success) {
      window.location.reload();
    }
  });
}

function initEvents() {
  // select the element's id and add an event to it
  $("#teamsForm").addEventListener(`submit`, onSubmit);
  $("#teamsTable tbody").addEventListener("click", e => {
    if (e.target.matches("button.delete-btn")) {
      const id = e.target.dataset.id;
      deleteTeamRequest(id).then(status => {
        if (status.success) {
          window.location.reload();
        }
      });
    }
  });
}
// calling the functions
initEvents();
loadTeams();
