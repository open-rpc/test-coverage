import coverage from "./coverage";
import { OpenRPC } from "@open-rpc/meta-schema";



const mockSchema = {
  openrpc: "1.0.0",
  info: {
    title: "my api",
    version: "0.0.0-development"
  },
  methods: [
    {
      name: 'foo',
      params: [],
      result: {
        name: 'fooResult',
        schema: {
          type: 'boolean'
        }
      }
    }
  ]
} as OpenRPC


describe('coverage', () => {
  it('can call the reporter', (done) => {
    const reporter = () => done()
    const transport = () => Promise.resolve({})
    coverage({
      reporter,
      transport,
      schema: mockSchema,
      skipMethods: []
    })
  })
  it('can call the transport', (done) => {
    const reporter = () => {}
    const transport = () => {
      done();
      return Promise.resolve({});
    }
    coverage({
      reporter,
      transport,
      schema: mockSchema,
      skipMethods: []
    })
  })
});