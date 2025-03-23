//Query selector
const enter = document.querySelector(".enter");
const chooseFloor = document.querySelector(".chooseFloor");
const orderSignal = document.querySelector(".order-signal");
const loadSignal = document.querySelector(".load-signal");
const floorButtons = document.querySelectorAll(".floors button");

//Gloabal Variables
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

//lift weight
let liftWeight = 0;
async function calculateLiftWeight() {
  await getData();
  liftWeight = 0;
  if (liftUsers) {
    for (let user of liftUsers) {
      liftWeight += user.weight;
    }
  }
  if(liftWeight>900){
    loadSignal.style.backgroundColor = "red";
  }
  console.log("Total lift weight", liftWeight);
}
calculateLiftWeight();

//add floor to next
async function addFloorToNext(floorNumber){
  let nextFloors = liftApi.nextFloors;
  if (!nextFloors.includes(floorNumber)) {
    nextFloors.push(floorNumber);
    await updateLift({ nextFloors: nextFloors });
  }
}

//enter button color and text change
async function enterColor(){
  await getData();
  if(liftApi.usersInside.includes(userApi.username)){
    enter.style.backgroundColor = "yellow";
    enter.textContent = "GET OUT";
  }
  else if(userApi.currentFloor === liftApi.currentFloor){
    enter.style.backgroundColor = "green";
    enter.textContent = "ENTER NOW";
  }
  else if(userApi.desiredFloor){
    enter.style.backgroundColor = "red";
    enter.textContent = "WAITING";
  }
}
enterColor();

//when click enter
async function showFloors(){
  await getData();
  if(!liftApi.order){
    alert("Lift out of order");
    return;
  }
  if(liftApi.usersInside.includes(userApi.username)){
    let newUsersInside = liftApi.usersInside.filter(username => username !== userApi.username);
    updateLift({usersInside: newUsersInside});
    await calculateLiftWeight();
    await enterColor();
  }
  else if(userApi.currentFloor === liftApi.currentFloor){
    await calculateLiftWeight();
    if(liftWeight>900){
      alert("lift overload");
      return;
    }

    chooseFloor.style.visibility = "visible";
  }
  else{
    if(!userApi.desiredFloor){
      await updateUser(userApi.username, {desiredFloor: true});

      await addFloorToNext(userApi.currentFloor);

      await enterColor();
    }
  }
}
enter.addEventListener("click", showFloors);

//floor buttons event listner
for (let button of floorButtons) {
  button.addEventListener("click", function() {
    let floor = Number(button.textContent);
    addFloorToNext(floor);

    chooseFloor.style.visibility = "hidden";

    updateUser(userApi.username, {desiredFloor: false});

    let newUsersInside = liftApi.usersInside;
    newUsersInside.push(userApi.username);
    updateLift({usersInside: newUsersInside});
    calculateLiftWeight();
    enterColor();
  });
}

//delete current floor from next floor in lift
async function removeCurrentFloorFromNext() {
  let updatedNextFloors = liftApi.nextFloors.filter(floor => floor !== liftApi.currentFloor);
  await updateLift({ nextFloors: updatedNextFloors });
}