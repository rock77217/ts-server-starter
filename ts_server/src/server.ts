import App from "@/app";
import AdmRoute from "@/routes/adm.route";
import IndexRoute from "@/routes/index.route";

const app = new App([new IndexRoute(), new AdmRoute()]);

app.listen();
