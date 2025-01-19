import "./style.css";

//  gets team as a json object and returns it as a string
function getTeamAsHTML(team) {
  return `<tr>
            <td>${team.promotion}</td>
            <td>${team.members}</td>
            <td>${team.name}</td>
            <td>${team.url}</td>
            <td>x</td>
          </tr>`;
}
// function to map values and inject them into the html
function renderTeams(teams) {
  const teamsHtml = teams.map(getTeamAsHTML);

  document.querySelector("#teamsTable tbody").innerHTML = teamsHtml.join("");
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
    .then(response => response.json())
    .then(teams => {
      renderTeams(teams);
      //  then print value in console to see if the fetch was successful console.warn("teams?", teams);
      // then actually print the value where you need it on the page
    });
}
// calling the function
loadTeams();
