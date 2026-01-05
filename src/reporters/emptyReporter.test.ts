import EmptyReporter from "./emptyReporter";
import { Call } from "../coverage";

describe("EmptyReporter", () => {
  it("logs success and error test results", () => {
    const reporter = new EmptyReporter();
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const successCall = { title: "success", valid: true } as Call;
    const errorCall = { title: "error", valid: false } as Call;

    reporter.onBegin({} as any, []);
    reporter.onTestBegin({} as any, successCall);
    reporter.onTestEnd({} as any, successCall);
    reporter.onTestEnd({} as any, errorCall);

    expect(logSpy).toHaveBeenCalledWith("Finished test success: success");
    expect(logSpy).toHaveBeenCalledWith("Finished test error: error");

    logSpy.mockRestore();
  });

  it("summarizes passed and failed calls", () => {
    const reporter = new EmptyReporter();
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const calls = [
      { title: "success", valid: true } as Call,
      { title: "error", valid: false } as Call,
    ];

    reporter.onEnd({} as any, calls);

    expect(logSpy).toHaveBeenCalledWith(
      "Finished the running 2 tests: 1 failed, 1 passed"
    );

    logSpy.mockRestore();
  });
});
