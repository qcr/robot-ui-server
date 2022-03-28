#include <napi.h>

static Napi::Value Method(const Napi::CallbackInfo& info) {
  if (info.Length() != 1) {
    Napi::Error::New(info.Env(), "Expected exactly one argument")
        .ThrowAsJavaScriptException();
    return info.Env().Undefined();
  }
  if (!info[0].IsObject()) {
    Napi::Error::New(info.Env(), "Expected an Object")
        .ThrowAsJavaScriptException();
    return info.Env().Undefined();
  }

  Napi::Object obj = info[0].As<Napi::Object>();
  int32_t width = obj.Get("width").As<Napi::Number>().Int32Value();
  int32_t height = obj.Get("height").As<Napi::Number>().Int32Value();
  
  Napi::Value buf = obj.Get("data");

  if (!buf.IsBuffer()) {
    Napi::Error::New(info.Env(), "Expected an ArrayBuffer")
        .ThrowAsJavaScriptException();
    return info.Env().Undefined();
  }

  Napi::Buffer<uint8_t> buffer = buf.As<Napi::Buffer<uint8_t> >();
  Napi::Buffer<uint8_t> out = Napi::Buffer<uint8_t>::New(info.Env(), width*height*4);

  int buf_stride = 3;
  int out_stride = 4;

  for (uint32_t i = 0; i < buffer.ByteLength() / 3; i++) {
    out.Data()[i*out_stride+0] = buffer.Data()[i*buf_stride+0];
    out.Data()[i*out_stride+1] = buffer.Data()[i*buf_stride+1];
    out.Data()[i*out_stride+2] = buffer.Data()[i*buf_stride+2];
    out.Data()[i*out_stride+4] = 255;
  }
  
  Napi::Object result = Napi::Object::New(info.Env());
  result.Set("width", width);
  result.Set("height", height);
  result.Set("data", out);

  return result;
}

static Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports["imgmsg2rgba"] = Napi::Function::New(env, Method);
  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)
