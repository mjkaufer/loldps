// To be pasted into browser
const me = new Mordekaiser();
const them = new Mordekaiser();
[me, them].forEach(c => {
  c.setLevel(6);
  c.setSkillProgression({Q: 3, W: 1, E: 1, R: 1});
})

const sim = new ChampSimulator(me, them);
sim.init();
console.log(sim.targetChampion.state.health);
sim.applySkillOrAuto('Q');
console.log(sim.targetChampion.state.health);