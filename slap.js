const csv = require('csv-parser');
const fs = require('fs');
const results = [];

let readApplicants = () => {
  return new Promise((resolve, reject) => {
    let read_stream = fs.createReadStream('applicants.csv').pipe(csv());
    read_stream.on('data', (data) => {
      for (let key in data) {
        if (key !== 'Name') {
          data[key] = parseInt(data[key]);
          data['Win'] = 0;
          data['Loss'] = 0;
        }
      }
      results.push(data)
    });
    return read_stream.on('end', () => {
      resolve(results);
    })
  })
};

let fight = (applicant1, applicant2) => {
  let fighter1 = applicant1, fighter2 = applicant2, combined_init = applicant1.Initiative + applicant2.Initiative;

  if (Math.random() * combined_init >= applicant1.Initiative) {
    fighter1 = applicant2, fighter2 = applicant1;
  }

  let fighter1_attack = {...fighter1}.Attacks, fighter2_attack = {...fighter2}.Attacks;
  let fighter1_health = {...fighter1}.Health, fighter2_health = {...fighter2}.Health;

  while (fighter1.Health > 0 && fighter2.Health > 0) {
    performAttack(fighter1, fighter2);
    if (fighter2.Health <= 0) {
      break;
    }
    performAttack(fighter2, fighter1);

    if (fighter1.Attacks === 0 && fighter2.Attacks === 0) {
      fighter1.Attacks = fighter1_attack;
      fighter2.Attacks = fighter2_attack;
    }
  }

  if (fighter1.Health <= 0 && fighter2.Health <= 0) {
    fighter1.Win += 1, fighter1.Loss += 1;
    fighter2.Win += 1, fighter2.Loss += 1;
    console.log(`${fighter1.Name} (${fighter1.Win}-${fighter1.Loss}) tied ${fighter2.Name} (${fighter2.Win}-${fighter2.Loss})`)
  }
  else if (fighter1.Health <= 0) {
    fighter2.Win += 1;
    fighter1.Loss += 1;
    console.log(`${fighter2.Name} (${fighter2.Win}-${fighter2.Loss}) has defeated ${fighter1.Name} (${fighter1.Win}-${fighter1.Loss})`)
  }
  else if (fighter2.Health <= 0) {
    fighter1.Win += 1;
    fighter2.Loss += 1;
    console.log(`${fighter1.Name} (${fighter1.Win}-${fighter1.Loss}) has defeated ${fighter2.Name} (${fighter2.Win}-${fighter2.Loss})`)
  }

  console.log('');

  fighter1.Attacks = fighter1_attack, fighter1.Health = fighter1_health;
  fighter2.Attacks = fighter2_attack, fighter2.Health = fighter2_health;


};

let performAttack = (attacker, defender) => {
  let attack = 0;
  if (attacker.Attacks) {
    let check_dodge = Math.random() * 100;
    if (check_dodge > defender.Dodge) {
      attack += attacker.Damage;
      if (Math.random() * 100 < attacker.Critical) {
        attack += attacker.Damage * 2;
      }
      attacker.Attacks--;
    }
  }

  defender.Health -= attack;
  console.log(`${attacker.Name} attacked ${defender.Name} for ${attack} damage.  ${defender.Name} now has ${defender.Health} health.`);
};


let checkApplicants = async () => {
  let results = await readApplicants();

  loopFightAndGetWinners(results);

};

let loopFightAndGetWinners = (fighters) => {
  loopFight(fighters);
  let winners = getWinners();
  if (winners.length > 1) {
    loopFightAndGetWinners(winners);
  }
  else {
    console.log(`Winner is ${winners[0].Name} with ${winners[0].Win} wins and ${winners[0].Loss} losses.`)
    return winners[0];
  }
};

let loopFight = (fighters) => {
  for (let i = 0; i < fighters.length; i++) {
    for (let j = i+1; j < fighters.length; j++) {
      fight(fighters[i], fighters[j]);
    }
  }
};

let getWinners = () => {
  let wins = {}, max_wins = 0;

  for (let i = 0; i < results.length; i++) {
    if (wins[results[i].Win]) {
      wins[results[i].Win].push(results[i]);
    }
    else {
      wins[results[i].Win] = [results[i]];
    }
  }

  for (let key in wins) {
    max_wins = Math.max(max_wins, parseInt(key));
  }

  return wins[max_wins];
};

checkApplicants();