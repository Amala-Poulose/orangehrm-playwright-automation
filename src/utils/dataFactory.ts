import { EmployeeData, EmployeeUpdate } from '../data/types';

const FIRST_NAMES = ['Ava', 'Liam', 'Noah', 'Emma', 'Olivia', 'Mason', 'Sophia', 'Lucas', 'Mia', 'Ethan'];
const LAST_NAMES = ['Carter', 'Hughes', 'Bennett', 'Foster', 'Reed', 'Brooks', 'Price', 'Hayes', 'Ward', 'Ross'];
const MARITAL_STATUSES = ['Single', 'Married', 'Other'] as const;

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** 8-digit value that is unique enough for a shared demo instance. */
export function uniqueId(): string {
  const time = Date.now().toString().slice(-6);
  const rand = Math.floor(Math.random() * 90 + 10).toString();
  return `${time}${rand}`;
}

/** Strong password that satisfies OrangeHRM's password policy. */
export function strongPassword(): string {
  return `Qa@Auto${uniqueId().slice(-4)}x`;
}

export function buildEmployee(options: { withLogin?: boolean; overrides?: Partial<EmployeeData> } = {}): EmployeeData {
  const id = uniqueId();
  const employee: EmployeeData = {
    firstName: pick(FIRST_NAMES),
    middleName: 'QA',
    lastName: `${pick(LAST_NAMES)}${id.slice(-4)}`,
    employeeId: id,
    ...options.overrides,
  };

  if (options.withLogin) {
    employee.login = {
      username: `qa.user${id}`,
      password: strongPassword(),
    };
  }
  return employee;
}

export function buildEmployeeUpdate(): EmployeeUpdate {
  const id = uniqueId();
  return {
    middleName: 'Updated',
    lastName: `Edited${id.slice(-4)}`,
    otherId: `OID${id.slice(-5)}`,
    maritalStatus: pick(MARITAL_STATUSES),
  };
}
