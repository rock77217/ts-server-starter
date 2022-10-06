import App from "./app";
import IndexRoute from "@routes/index.route";
import AdmRoute from "@routes/adm.route";

const app = new App([new IndexRoute(), new AdmRoute()]);

app.listen();
