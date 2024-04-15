import { ContentDescriptorObject } from "@open-rpc/meta-schema";

const paramsToObj = (
  params: any[],
  methodParams: ContentDescriptorObject[]
): any => {
  return params.reduce((acc, val, i) => {
    acc[methodParams[i].name] = val;
    return acc;
  }, {});
};

export default paramsToObj;
