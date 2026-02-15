export const APP_CONFIG = Object.freeze({
  API_SQL_BASE_URL: "https://rchu-comp4537.com/COMP4537/labs/4",
  SQL_WRAP_PREFIX: '"',
  SQL_WRAP_SUFFIX: '"'
});

export const UI_STRINGS = Object.freeze({
  PAGE_TITLE: "Lab 4 Patient DB Client (Server1)",
  HEADING: "Lab 4 – Patient DB Client (Origin 1)",
  SUBHEADING: "Uses POST to insert rows and GET to run SQL read queries on Server2.",
  INSERT_TITLE: "Part A: Insert fixed rows",
  INSERT_HELP: "Clicking multiple times inserts duplicates (table grows each click).",
  INSERT_BUTTON: "Insert Rows",
  QUERY_TITLE: "Part B: SQL Query (GET)",
  QUERY_LABEL: "SQL Query",
  QUERY_PLACEHOLDER: "Example: select * from patient",
  QUERY_BUTTON: "Submit Query",
  QUERY_HELP: "Tip: Start with select * from patient",
  STATUS_READY: "Ready.",
  STATUS_INSERTING: "Sending insert request...",
  STATUS_QUERYING: "Running SQL query...",
  STATUS_INSERT_OK: "Insert completed successfully.",
  STATUS_QUERY_OK: "Query completed successfully.",
  QUERY_DEFAULT_SQL: "select * from patient",
  STATUS_EMPTY_QUERY: "Please enter a SQL query.",
  STATUS_ERROR_PREFIX: "Request failed:",
});

export const INSERT_ROWS = Object.freeze([
  Object.freeze({ name: "Sara Brown", dateOfBirth: "1903-01-01" }),
  Object.freeze({ name: "John Smith", dateOfBirth: "1941-01-01" }),
  Object.freeze({ name: "Jack Ma", dateOfBirth: "1961-01-30" }),
  Object.freeze({ name: "Elon Musk", dateOfBirth: "1999-01-01" })
]);


