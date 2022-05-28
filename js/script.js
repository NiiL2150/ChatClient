var connection;

var token;

function buildConnection() {
  connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:9053/chat", {
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets,
    })
    .build();

  connection.on("Receive", (user, message, id) => {
    let messages = document.getElementById("results");

    let result = document.createElement("div");
    result.classList.add("alert", "alert-primary");
    result.innerHTML = `<b>${user} (${id}):</b> ${message}`;

    messages.prepend(result);
  });

  connection.on("ReceivePrivate", (user, message, id) => {
    let messages = document.getElementById("results");

    let result = document.createElement("div");
    result.classList.add("alert", "alert-secondary");
    result.innerHTML = `<b>${user} (${id}):</b> ${message}`;

    messages.prepend(result);
  });

  connection.on("UserList", (connectionids)=>{
    let users = connectionids.split(";");
    for(let i = 0; i < users.length; i++){
      let user = document.createElement("li");
      user.textContent = users[i];
      document.getElementById("connectedusers").appendChild(user);
    }
  })

  connection.on("Notify", (message, date, connectionid, isconnected) => {
    const notify = document.createElement("div");
    const id = `${date.toString()}${Date.now.toString()}`;
    notify.innerHTML = `<div id="${id}" class="toast m-2" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <strong class="me-auto">Notification</strong>
          <small>${date}</small>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="toast"
            aria-label="Close"
          ></button>
        </div>
        <div class="toast-body">${message}</div>
      </div>`;
    document.getElementById("notifications").appendChild(notify);
    const toast = new bootstrap.Toast(document.getElementById(id));
    toast.show();

    //add connectionid to the list in html if isconnected = true, otherwise remove it
    if(isconnected){
      let user = document.createElement("li");
      user.textContent = connectionid;
      document.getElementById("connectedusers").appendChild(user);
    }else{
      let users = document.getElementById("connectedusers").children;
      for(let i = 0; i < users.length; i++){
        if(users[i].textContent == connectionid){
          users[i].remove();
        }
      }
    }
  });
  connection.start();
}

function SendMessage() {
  let message = document.getElementById("message").value;
  connection.invoke("Send", token, message);
}

async function Login() {
  await fetch("http://localhost:9053/jwt/login", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: document.getElementById("username").value,
      password: document.getElementById("password").value,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data?.token != null) {
        document.getElementById("stage-1").classList.add("hidden");
        document.getElementById("stage-2").classList.remove("hidden");
        token = data.token;
        document.getElementById("activeusername").textContent =
          document.getElementById("username").value;
        buildConnection();
      } else {
        alert(data.error);
      }
    });
}

async function Register() {
  await fetch("http://localhost:9053/jwt/registration", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: document.getElementById("username").value,
      password: document.getElementById("password").value,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.error == "No error") {
        alert("Registration is successful");
      } else {
        alert(data.error);
      }
    });
}
