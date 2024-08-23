import { Call, IOptions } from "../coverage";
import Reporter from "./reporter";
import fs from "fs";
import { execSync } from "child_process";
import path from "path";

interface HtmlReporterOptions {
  autoOpen?: boolean;
  destination?: string;
}

class HtmlReporter implements Reporter {
  private autoOpen: boolean = true;
  private destination: string = process.cwd() + "/html-report";

  constructor(options?: HtmlReporterOptions) {
    if (options?.autoOpen !== undefined) {
      this.autoOpen = options.autoOpen;
    }
    if (options?.destination !== undefined) {
      this.destination = options.destination;
    }
  }

  onBegin(options: IOptions, calls: Call[]) {}
  onTestBegin(options: IOptions, call: Call) {}

  onTestEnd(options: IOptions, call: Call) {}

  async onEnd(options: IOptions, calls: Call[]) {
    const massaged: any = calls.map((c) => {
      return {
        ...c,
        rule: c.rule?.getTitle(),
      };
    });
    const htmlReportAppPath = require.resolve("@open-rpc/html-reporter-react");
    const destinationPath = this.destination + "/index.html";

    await fs.promises.mkdir(this.destination, { recursive: true });

    // Copying the HTML file to the desired directory.
    await fs.promises.copyFile(
      htmlReportAppPath.replace("index.js", "index.html"),
      destinationPath
    );

    let htmlContent = await fs.promises.readFile(destinationPath, "utf8");

    const jsonData = JSON.stringify(massaged);

    const scriptToInsert = `<script>window.openrpcReport = ${jsonData};</script>`;

    // Insert the script tag right after the opening <head> tag.
    htmlContent = htmlContent.replace(/(<head>)/i, `$1\n${scriptToInsert}`);

    // Write the modified HTML back to the file.
    await fs.promises.writeFile(destinationPath, htmlContent, "utf8");

    if (this.autoOpen) {
      execSync(`open ${destinationPath}`);
    }
  }
}

export default HtmlReporter;
