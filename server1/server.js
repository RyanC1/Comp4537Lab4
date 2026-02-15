import { APP_CONFIG, UI_STRINGS, INSERT_ROWS } from "./strings.js";

class PatientDbClientApp {
  constructor(config, uiStrings, insertRowsData) {
    this.config = config;
    this.uiStrings = uiStrings;
    this.insertRowsData = insertRowsData;

    this.elements = {
      heading: document.getElementById("heading"),
      subheading: document.getElementById("subheading"),
      insertTitle: document.getElementById("insertTitle"),
      insertHelp: document.getElementById("insertHelp"),
      insertBtn: document.getElementById("insertBtn"),
      queryTitle: document.getElementById("queryTitle"),
      queryLabel: document.getElementById("queryLabel"),
      queryHelp: document.getElementById("queryHelp"),
      sqlQuery: document.getElementById("sqlQuery"),
      queryBtn: document.getElementById("queryBtn"),
      statusLine: document.getElementById("statusLine"),
      output: document.getElementById("output")
    };

    this.handleInsertClick = this.handleInsertClick.bind(this);
    this.handleQueryClick = this.handleQueryClick.bind(this);
    this.handleQueryKeydown = this.handleQueryKeydown.bind(this);
  }

  start() {
    this.initUi();
    this.attachEvents();
  }

  attachEvents() {
    this.elements.insertBtn.addEventListener("click", this.handleInsertClick);
    this.elements.queryBtn.addEventListener("click", this.handleQueryClick);
    this.elements.sqlQuery.addEventListener("keydown", this.handleQueryKeydown);
  }

  initUi() {
    document.title = this.uiStrings.PAGE_TITLE;
    this.elements.heading.textContent = this.uiStrings.HEADING;
    this.elements.subheading.textContent = this.uiStrings.SUBHEADING;
    this.elements.insertTitle.textContent = this.uiStrings.INSERT_TITLE;
    this.elements.insertHelp.textContent = this.uiStrings.INSERT_HELP;
    this.elements.insertBtn.textContent = this.uiStrings.INSERT_BUTTON;
    this.elements.queryTitle.textContent = this.uiStrings.QUERY_TITLE;
    this.elements.queryLabel.textContent = this.uiStrings.QUERY_LABEL;
    this.elements.queryHelp.textContent = this.uiStrings.QUERY_HELP;
    this.elements.queryBtn.textContent = this.uiStrings.QUERY_BUTTON;
    this.elements.sqlQuery.placeholder = this.uiStrings.QUERY_PLACEHOLDER;
    this.elements.sqlQuery.value = this.uiStrings.QUERY_DEFAULT_SQL;

    this.setStatus(this.uiStrings.STATUS_READY, false);
    this.setOutput("");
  }

  normalizedApiBaseUrl() {
    return this.config.API_SQL_BASE_URL.replace(/\/+$/, "");
  }

  buildGetSqlUrl(rawSql) {
    const wrappedSql = `${this.config.SQL_WRAP_PREFIX}${rawSql}${this.config.SQL_WRAP_SUFFIX}`;
    return `${this.normalizedApiBaseUrl()}/${encodeURIComponent(wrappedSql)}`;
  }

  buildRequestOptions(method, payload) {
    const options = {
      method,
      headers: {
        Accept: "application/json"
      }
    };

    // Keep this as a simple CORS request for current server2 behavior.
    if (payload !== undefined) {
      options.body = JSON.stringify(payload);
    }

    return options;
  }

  setBusy(isBusy) {
    this.elements.insertBtn.disabled = isBusy;
    this.elements.queryBtn.disabled = isBusy;
    this.elements.sqlQuery.disabled = isBusy;
  }

  setStatus(message, isError) {
    this.elements.statusLine.textContent = message;
    this.elements.statusLine.classList.toggle("error", Boolean(isError));
  }

  setOutput(message) {
    this.elements.output.textContent = message;
  }

  renderHttpSummary(response, bodyText) {
    const statusSummary = `HTTP ${response.status} ${response.statusText}`.trim();
    if (bodyText && bodyText.trim().length > 0) {
      return `${statusSummary}\n\n${bodyText}`;
    }
    return statusSummary;
  }

  prettifyBodyIfJson(text) {
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      return text;
    }
  }

  sendRequest({ url, method, payload, busyMessage, successMessage, prettifyJsonResponse }) {
    this.setBusy(true);
    this.setStatus(busyMessage, false);

    return fetch(url, this.buildRequestOptions(method, payload))
      .then(async (response) => {
        const bodyText = await response.text();
        if (!response.ok) {
          throw new Error(this.renderHttpSummary(response, bodyText));
        }
        return { response, bodyText };
      })
      .then(({ response, bodyText }) => {
        this.setStatus(successMessage, false);
        if (prettifyJsonResponse) {
          this.setOutput(this.prettifyBodyIfJson(bodyText));
        } else {
          this.setOutput(this.renderHttpSummary(response, bodyText));
        }
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        this.setStatus(`${this.uiStrings.STATUS_ERROR_PREFIX} ${message}`, true);
        this.setOutput(message);
      })
      .finally(() => {
        this.setBusy(false);
      });
  }

  handleInsertClick() {
    return this.sendRequest({
      url: this.normalizedApiBaseUrl(),
      method: "POST",
      payload: this.insertRowsData,
      busyMessage: this.uiStrings.STATUS_INSERTING,
      successMessage: this.uiStrings.STATUS_INSERT_OK,
      prettifyJsonResponse: false
    });
  }

  handleQueryClick() {
    const sql = this.elements.sqlQuery.value.trim();
    if (!sql) {
      this.setStatus(this.uiStrings.STATUS_EMPTY_QUERY, true);
      return Promise.resolve();
    }

    return this.sendRequest({
      url: this.buildGetSqlUrl(sql),
      method: "GET",
      busyMessage: this.uiStrings.STATUS_QUERYING,
      successMessage: this.uiStrings.STATUS_QUERY_OK,
      prettifyJsonResponse: true
    });
  }

  handleQueryKeydown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      this.handleQueryClick();
    }
  }
}

// Adds validation to ensure qurery isnt empty before passing it to the database
async function handleGet(req, res) {
  try {
        const parsedUrl = url.parse(req.url, true)
        // Get everything after the last slash
        const pathParts = parsedUrl.pathname.split('/').filter(Boolean)
        const query = pathParts.length > 0 
            ? decodeURIComponent(pathParts[pathParts.length - 1])
            : ''
            
        if (!query) {
          res.writeHead(400, 'Missing query parameter', { 'Content-Type': 'text/html' });
          return;
        }
        
        const [rows] = await this.dao.getPatients(query.replace(/^["'](.*)["']$/, '$1'))
        const body = JSON.stringify(rows)
        res.writeHead(200, "OK", { "Content-Type": "application/json", "Content-Length": body.length });
        res.write(body)
    }
    catch (e) {
        if (e.errno) {
          res.writeHead(400, `SQL Error: ${e.sqlMessage}`, { 'Content-Type': 'text/html' });
        } else {
          res.writeHead(500, `Unknown server error`, { 'Content-Type': 'text/html' });
        }
        console.error(e)
      }
    }
    
    const app = new PatientDbClientApp(APP_CONFIG, UI_STRINGS, INSERT_ROWS);
    app.start();