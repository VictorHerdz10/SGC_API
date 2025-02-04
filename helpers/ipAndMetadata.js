import platform from "platform";

export const ipAddress = (req) => {
  return req.headers["x-forwarded-for"] || req.ip;
};

export const userAgent = (req) => {
  const userAgent = platform.parse(req.headers["user-agent"]);
  const metadata = {
    navegador: userAgent.name,
    version: userAgent.version,
    sistema_operativo: userAgent.os,
  };
  console.log(metadata)
  return metadata;
};
