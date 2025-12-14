/**
 * Main - hlavný tok programu:
 * 1) vygeneruje zoznam zamestnancov
 * 2) vypočíta štatistiky
 * 3) vráti dtoOut
 * @param {object} dtoIn
 * @returns {object} dtoOut
 */
export function main(dtoIn) {
  const employees = generateEmployeeData(dtoIn);
  const dtoOut = getEmployeeStatistics(employees);
  return dtoOut;
}

/**
 * generateEmployeeData - vygeneruje zo vstupu zoznam zamestnancov (Domácí úkol 3)
 * @param {object} dtoIn
 * @returns {Array} employees
 */
export function generateEmployeeData(dtoIn) {
  const count = dtoIn.count;
  const minAge = dtoIn.age.min;
  const maxAge = dtoIn.age.max;

  const firstNames = [
    "Teresa","Rosalinda","Marimar","Esmeralda","Luciana","Fernanda","Camila","Valentina","Renata","Isabela",
    "Paulina","Jimena","Gabriela","Mariana","Julieta","Catalina","Alejandra","Daniela","Sofía","Verónica",
    "Bianca","Regina","Lourdes","Natalia","Patricia","Alejandro","Fernando","Armando","Ricardo","Eduardo",
    "Sebastián","Diego","Mauricio","Bruno","Carlos","Andrés","Esteban","Santiago","León","Julio",
    "Rodrigo","Rafael","Cristóbal","Emilio","Marco","Joaquín","Mateo","Manuel","Héctor","Álvaro"
  ];

  const lastNames = [
    "Mendoza","Chávez","Salazar","Montenegro","López","Hernández","García","Villalba","Valencia","Rojas",
    "Castillo","Benavides","Torres","Rivera","Flores","Márquez","Carrillo","Duarte","Castañeda","Gutiérrez",
    "Herrera","Camacho","Álvarez","Navarro","Morales","Cabrera","Zamora","Ponce","Aguilar","Rosales",
    "Peña","Solís","Cortés","Ramírez","Fajardo","Domínguez","Bravo","Villaseñor","Ochoa","Fuentes",
    "Barrios","Salinas","Cárdenas","Vergara","Arango","Paredes","Beltrán","Ledesma","Escobar","Montoya"
  ];

  const workloads = [10, 20, 30, 40];
  const employees = [];

  // aby sa dátumy narodenia neopakovali
  const usedBirthdates = new Set();

  for (let i = 0; i < count; i++) {
    const name = getRandomElement(firstNames);
    const surname = getRandomElement(lastNames);
    const gender = Math.random() < 0.5 ? "male" : "female";
    const workload = getRandomElement(workloads);

    // bez duplicitných dátumov narodenia
    let birthdate;
    do {
      birthdate = generateRandomBirthdate(minAge, maxAge);
    } while (usedBirthdates.has(birthdate));
    usedBirthdates.add(birthdate);

    employees.push({
      gender,
      birthdate,
      name,
      surname,
      workload
    });
  }

  return employees;
}

/**
 * getEmployeeStatistics - vypočíta štatistiky zo zoznamu zamestnancov
 * @param {Array} employees
 * @returns {object} dtoOut
 */
export function getEmployeeStatistics(employees) {
  const total = employees.length;

  // počty podľa workload
  let workload10 = 0;
  let workload20 = 0;
  let workload30 = 0;
  let workload40 = 0;

  // vek (ako desatinné číslo) - budeme z nich robiť priemer/median/min/max
  const ages = [];

  // workloads pre median
  const workloads = [];

  // ženy - workload priemer
  let womenCount = 0;
  let womenWorkloadSum = 0;

  for (const emp of employees) {
    // workloads count
    if (emp.workload === 10) workload10++;
    else if (emp.workload === 20) workload20++;
    else if (emp.workload === 30) workload30++;
    else if (emp.workload === 40) workload40++;

    workloads.push(emp.workload);

    // vek ako desatinné číslo
    const age = computeAge(emp.birthdate);
    ages.push(age);

    // ženy
    if (emp.gender === "female") {
      womenCount++;
      womenWorkloadSum += emp.workload;
    }
  }

  // averageAge na 1 desatinné miesto
  const averageAge = roundTo1(sum(ages) / total);

  // minAge / maxAge / medianAge sa majú zaokrúhliť na celé číslo
  const minAge = Math.round(Math.min(...ages));
  const maxAge = Math.round(Math.max(...ages));
  const medianAge = Math.round(median(ages));

  // medianWorkload je celé číslo
  const medianWorkload = Math.round(median(workloads));

  // averageWomenWorkload - na 1 desatinné miesto
  const averageWomenWorkload =
    womenCount === 0 ? 0 : roundTo1(womenWorkloadSum / womenCount);

  // zoradenie podľa workload (číselne) - od najmenšieho po najväčší
  const sortedByWorkload = [...employees].sort((a, b) => a.workload - b.workload);

  return {
    total,
    workload10,
    workload20,
    workload30,
    workload40,
    averageAge,
    minAge,
    maxAge,
    medianAge,
    medianWorkload,
    averageWomenWorkload,
    sortedByWorkload
  };
}

/* =======================
   Pomocné funkcie
   ======================= */

function getRandomElement(array) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomBirthdate(minAge, maxAge) {
  const nowMs = Date.now();
  const MS_IN_YEAR = 365.25 * 24 * 60 * 60 * 1000;

  const oldestMs = nowMs - maxAge * MS_IN_YEAR;     // najstarší (väčší vek)
  const youngestMs = nowMs - minAge * MS_IN_YEAR;   // najmladší (menší vek)

  const randomMs = getRandomInt(Math.floor(oldestMs), Math.floor(youngestMs));
  const date = new Date(randomMs);

  // na polnoc UTC
  date.setUTCHours(0, 0, 0, 0);

  return date.toISOString();
}

function computeAge(birthdateIso) {
  const nowMs = Date.now();
  const birthMs = new Date(birthdateIso).getTime();
  const MS_IN_YEAR = 365.25 * 24 * 60 * 60 * 1000;
  return (nowMs - birthMs) / MS_IN_YEAR; // desatinné roky
}

function sum(arr) {
  let s = 0;
  for (const x of arr) s += x;
  return s;
}

function roundTo1(value) {
  return Math.round(value * 10) / 10;
}

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const n = sorted.length;
  const mid = Math.floor(n / 2);

  if (n % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}
