const $=id=>document.getElementById(id);
const exercises=[
 ["Squats","8–10 reps"],["Wall push-ups","6–8 reps"],["Glute bridge","8–10 reps"],
 ["Bird dog","6 each side"],["Reverse lunges","5 each leg"],["Prone W raises","8 reps"],
 ["Calf raises","10–12 reps"],["Plank","10–15 seconds"]
];
const phases=[["Foundation","Weeks 1–2","20 min"],["Building","Weeks 3–4","20–25 min"],["Progress","Weeks 5–6","25–30 min"],["Steady Strength","Week 7+","Up to 30 min"]];
const load=()=>{try{return JSON.parse(localStorage.getItem("bktFitnessData"))||{history:[],sleep:[],weights:[],recovery:{}}}catch{return {history:[],sleep:[],weights:[],recovery:{}}}};
let data=load();
const today=()=>new Date().toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"});
function phaseIndex(){return Math.min(3,Math.floor(data.history.length/6))}
function render(){
 const p=phaseIndex();$("phaseName").textContent=phases[p][0];$("phaseWeeks").textContent=phases[p][1];$("todayDuration").textContent=phases[p][2];
 $("sessions").textContent=data.history.length;
 const count=data.history.filter(x=>x.date===today()).length;
 $("streak").textContent=count?"Active today":"0 days";
 $("progressBar").style.width=((data.history.length%6)/6*100)+"%";
 $("progressLabel").textContent=(data.history.length%6)+" of 6 sessions in this phase";
 $("history").innerHTML=data.history.length?data.history.slice(-5).reverse().map(x=>`<div class="history-item"><span>${x.date}</span><strong>${x.duration} min</strong></div>`).join(""):'<p class="muted small">No workouts saved yet.</p>';
}
$("exerciseList").innerHTML=exercises.map((e,i)=>`<label class="exercise"><input type="checkbox" class="done"><span><span class="name">${i+1}. ${e[0]}</span><span class="dose">${e[1]}</span></span></label>`).join("");
$("saveWorkout").addEventListener("click",()=>{
 const checks=[...document.querySelectorAll(".done")];const done=checks.filter(x=>x.checked).length;
 if(done!==exercises.length){$("workoutMessage").textContent="Complete all 8 checkboxes first, or reset and take a rest day.";return}
 const mins=Number(prompt("Workout duration in minutes?","20"));
 if(!Number.isFinite(mins)||mins<1||mins>180){$("workoutMessage").textContent="Please enter a valid duration.";return}
 data.history.push({date:today(),duration:mins});save();checks.forEach(x=>x.checked=false);$("workoutMessage").textContent="Workout saved. Great job—recover well!";render();
});
$("resetChecks").onclick=()=>{document.querySelectorAll(".done").forEach(x=>x.checked=false);$("workoutMessage").textContent="Checks reset.";};
function save(){localStorage.setItem("bktFitnessData",JSON.stringify(data))}
document.querySelectorAll("[data-recovery]").forEach(b=>b.onclick=()=>{data.recovery[today()]=b.dataset.recovery;save();document.querySelectorAll("[data-recovery]").forEach(x=>x.classList.toggle("selected",x===b));$("recoveryText").textContent="Today's recovery: "+b.dataset.recovery+". If tired or sore, choose rest or an easier day.";});
$("saveSleep").onclick=()=>{const v=Number($("sleep").value);if(!v||v<0||v>24){$("sleepMessage").textContent="Enter sleep hours from 0 to 24.";return}data.sleep.push({date:today(),hours:v});save();$("sleepMessage").textContent="Sleep entry saved.";};
$("saveWeight").onclick=()=>{const v=Number($("weight").value);if(!v||v<1||v>300){$("weightMessage").textContent="Enter a valid number, or skip weight tracking.";return}data.weights.push({date:today(),kg:v});save();$("weightMessage").textContent="Entry saved. Weight tracking is optional; no target is set.";};
let installPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;$("installBtn").classList.remove("hidden")});
$("installBtn").onclick=async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$("installBtn").classList.add("hidden")};
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
render();
