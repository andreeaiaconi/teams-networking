const baseURL = "http://localhost:3000/teams-json";

export function loadTeamsRequest() {
  return fetch(baseURL, {
    // getting values from this server
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  }).then(r => r.json());
}

export function createTeamRequest(team) {
  return fetch(`${baseURL}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  }).then(r => r.json());
}

export function deleteTeamRequest(id) {
  return fetch(`${baseURL}/delete`, {
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

export function updateTeamRequest(team) {
  // PUT teams-json/update
  return fetch(`${baseURL}/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  }).then(r => r.json());
}
