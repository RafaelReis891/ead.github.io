const ranking = [
  {
    name:"Rafael",
    points:900
  },
  {
    name:"Carlos",
    points:700
  },
  {
    name:"Ana",
    points:650
  }
];

const list = document.getElementById("rankingList");

ranking.forEach((user,index)=>{

  const div = document.createElement("div");

  div.className = "ranking-item";

  div.innerHTML = `
    <span>#${index+1}</span>
    <span>${user.name}</span>
    <span>${user.points}</span>
  `;

  list.appendChild(div);

});