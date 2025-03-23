const go = document.querySelector(".go");
const camera = document.querySelector(".camera");
const orderSignal = document.querySelector(".order-signal");
const showUsersInside = document.querySelector(".showUsersInside");
const rescue = document.querySelector(".rescue");
const next = document.querySelector(".next")

let userApi = null;
let liftApi = null;
let liftUsers = null;

//Fetch api
async function getData() {
  const url = "/api";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    userApi = json.userApi;
    liftApi = json.liftApi;
    liftUsers = json.liftUsers;

    if(!liftApi.order){
      orderSignal.style.backgroundColor = "red";
    }
    else{
        orderSignal.style.backgroundColor = "green";
    }

    if(!liftApi.order && liftUsers && liftUsers.length > 0){
      rescue.style.visibility = "visible";
    }
    else{
      rescue.style.visibility = "hidden";
    }

    if(liftApi.nextFloors.length===0){
      next.style.visibility = "hidden";
    }
    else{
      next.style.visibility = "visible";
    }

  } catch (error) {
    console.error(error.message);
  }
}
document.addEventListener('DOMContentLoaded', getData);


//update user/lift
async function updateUser(username, changes){
await fetch(`/api/user/${username}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(changes)
});
await getData();
}

async function updateLift(changes){
await fetch(`/api/lift`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(changes)
});
await getData();
}

async function clickGo(){
    await getData();
    if(liftApi.nextFloors.length === 0){
      alert("No requested Floor. Chill :)");
      return;
    }
    await updateLift({currentFloor: liftApi.nextFloors[0]});
    await removeCurrentFloorFromNext();
    location.reload();
}
go.addEventListener('click',clickGo);

//remove current floor from next
async function removeCurrentFloorFromNext() {
    let updatedNextFloors = liftApi.nextFloors.filter(floor => floor !== liftApi.currentFloor);
    await updateLift({ nextFloors: updatedNextFloors });
}

//ordersignal
async function changeOrderSignal(){
    await updateLift({order: !liftApi.order});
    await getData();
}
orderSignal.addEventListener('click', changeOrderSignal);

//showusers
async function displayUser(){
    await getData();
    if(liftUsers.length===0){
      alert("No users inside");
      return;
    }
    for(let user of liftUsers){
        console.log(user.username);
        const newDiv = document.createElement('div');
        const newImg = document.createElement('img');
        newImg.src = user.photo;
        newImg.height = 50;
        newImg.style.borderRadius = "50%";
        const newText = document.createElement('p');
        newText.textContent = user.username;
        newDiv.appendChild(newImg);
        newDiv.appendChild(newText);
        showUsersInside.appendChild(newDiv);
    }
    showUsersInside.style.visibility = "visible";
}
camera.addEventListener('click', displayUser);

//rescue
async function rescueUsers(){
  const newUsersInside = [];
  await updateLift({usersInside: newUsersInside});
  await getData();
}
rescue.addEventListener('click', rescueUsers);