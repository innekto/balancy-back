const emailRegex =
  /^(?!.*\s)(?=.{6,320}$)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const passwordRegex =
  /^(?!.*[А-Яа-яЁёЇїЄєҐґІі])(?=.*[A-Z])(?=.*\d)(?=.*[ !"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]).*$/;

const userNameRegex =
  /^[A-Z0-9А-Я!@#\$%^&*_+\-=~?][A-Za-z0-9А-Яа-я!@#\$%^&*_+\-=~?]*$/;

const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const taskTitleRegex =
  /^[A-Za-zА-Яа-яЇїІіЄєҐґ0-9 !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]+$/;

export {
  emailRegex,
  isoDateRegex,
  passwordRegex,
  taskTitleRegex,
  userNameRegex,
};
