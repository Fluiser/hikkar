#define NAPI_CPP_EXCEPTIONS
// #define DEBUG
#include <napi.h>
#include <string.h>
#include <iostream>
#include "hex.cpp"
using namespace Napi;

void bufferWrite(const CallbackInfo& args)
{
    /*
     * callback(
     *  Buffer toWrite,
     *  Buffer readFrom,
     *  size_t startRead - for readFrom buffer
     *  size_t startWrite - for toWrite Buffer
     *  size_t endRead - for endPTR reading iterator.
     * )
     * */
    if(args.Length() < 5) napi_throw_error(args.Env(), NULL, "Not defined need arguments");
    char* out = args[0].As<Buffer<char>>().Data();
    const char* input = args[1].As<Buffer<char>>().Data();
    int32_t startRead = args[2].As<Number>().Int32Value();
    int32_t startWrite = args[3].As<Number>().Int32Value();
    int32_t endRead = args[4].As<Number>().Int32Value();

    memcpy((void*)(out+startWrite), (void*)(input+startRead), endRead);
}

String castString(const CallbackInfo& args)
{
    //buffer, offset?, ?end
    if(args.Length() < 1) napi_throw_error(args.Env(), NULL, "Not defined need arguments");
    Buffer<char> b = args[0].As<Buffer<char>>();
    size_t start = (args.Length() >= 2 ? args[1].As<Number>().Int64Value() : 0);
    size_t end = (args.Length() >= 3 ? args[2].As<Number>().Int64Value() : b.Length());

    return String::New(args.Env(), b.Data()+start, end-start);
}

Number castInt8(const CallbackInfo& args)
{
    if(args.Length() < 1) napi_throw_error(args.Env(), NULL, "Not defined need arguments");
    int32_t v = *(char*)args[0].As<Buffer<char>>().Data();
    return Number::New(args.Env(), v);
}

//Number castUInt8(const CallbackInfo& args)
//{
//    if(args.Length() < 1) napi_throw_error(args.Env(), NULL, "Not defined need arguments");
//    int32_t v = *(unsigned char*)args[0].As<Buffer<char>>().Data();
//    return Number::New(args.Env(), v);
//}

Number castInt32(const CallbackInfo& args)
{
    if(args.Length() < 1) napi_throw_error(args.Env(), NULL, "Not defined need arguments");
    int32_t* v = (int32_t*)args[0].As<Buffer<char>>().Data();
    return Number::New(args.Env(), *v);
}

Number castUnsignedInt32(const CallbackInfo& args)
{
    if(args.Length() < 1) napi_throw_error(args.Env(), NULL, "Not defined need arguments");
    uint32_t* v = (uint32_t*)args[0].As<Buffer<char>>().Data();
    return Number::New(args.Env(), *v);
}

Number castInt64(const CallbackInfo& args)
{
    if(args.Length() < 1) napi_throw_error(args.Env(), NULL, "Not defined need arguments");
    int64_t* v = (int64_t*)args[0].As<Buffer<char>>().Data();
    return Number::New(args.Env(), *v);
}

Number castUnsignedInt64(const CallbackInfo& args)
{
    if(args.Length() < 1) napi_throw_error(args.Env(), NULL, "Not defined need arguments");
    uint64_t* v = (uint64_t*)args[0].As<Buffer<char>>().Data();
    return Number::New(args.Env(), *v);
}

uint32_t FormatFromUTF8(const char* str, uint32_t& idx)
{
    uint8_t c1 = (uint8_t)str[idx];
    ++idx;
    uint32_t utf8c;

    if (((c1 >> 6) & 0b11) == 0b11) {
        uint8_t c2 = (uint8_t) str[idx];
        ++idx;
        if ((c1 >> 5) & 1) {
            uint8_t c3 = (uint8_t) str[idx];
            ++idx;
            if ((c1 >> 4) & 1) {
                uint8_t c4 = (uint8_t) str[idx];
                ++idx;
                utf8c = ((c4 & 0b00000111) << 18) | ((c3 & 0b00111111) << 12) | ((c2 & 0b00111111) << 6) | (c1 & 0b00111111);
            } else utf8c = ((c3 & 0b00001111) << 12) | ((c2 & 0b00111111) << 6) | (c1 & 0b00111111);
        } else utf8c = ((c1 & 0b00011111) << 6) | (c2 & 0b00111111);
    } else utf8c = c1 & 0b01111111;

    return utf8c;
}

void memcpy_buffer(const CallbackInfo& args)
{
    if(args.Length() < 3) napi_throw_error(args.Env(), NULL, "Not defined need arguments");
    unsigned char* data = args[0].As<Buffer<unsigned char>>().Data();
    std::string str = args[1].As<String>().Utf8Value();
    int32_t size = args[2].As<Number>().Int32Value();

    const char* d = str.c_str();
    for(size_t i = 0; i < size; ++i)
    {
        uint32_t idx = 0;
        uint32_t v = FormatFromUTF8(d, idx);
        data[i] = v;
        d += idx;
    }
}

String compressNumber(const CallbackInfo& args)
{
    int64_t n = args[0].As<Number>().Int64Value();
    std::string str;
    destHex(n, str);
    return String::New(args.Env(), str);
}

auto BufferFromNumber(const CallbackInfo& args)
{
    if(args.Length() < 1) napi_throw_error(args.Env(), NULL, "Not defined need arguments");
    int64_t number = args[0].As<Number>().Int64Value();
    size_t offset = (args.Length() >= 2 ? args[1].As<Number>().Int64Value(): 0);
    Buffer<char> b = Buffer<char>::New(args.Env(), offset+sizeof(number));
    char* data = b.Data();
    memset(data, 0, offset);
    *((int64_t*)(data + offset)) = number;
    return b;
}

Number extractNumber(const CallbackInfo& args)
{
    return Number::New(args.Env(), extrHex(args[0].As<String>()));
}

Object Init(Env env, Object exports)
{
    exports.Set("sbWrite", Function::New(env, bufferWrite));
    exports.Set("cint8", Function::New(env, castInt8));
//    exports.Set("cintu8", Function::New(env, castUInt8));
    exports.Set("cint32", Function::New(env, castInt32));
    exports.Set("cuint32", Function::New(env, castUnsignedInt32));
    exports.Set("cint64", Function::New(env, castInt64));
    exports.Set("cuint64", Function::New(env, castUnsignedInt64));
    exports.Set("buffer_from_string_memcpy", Function::New(env, memcpy_buffer));
    exports.Set("compressNumber", Function::New(env, compressNumber));
    exports.Set("extractNumber", Function::New(env, extractNumber));
    exports.Set("castString", Function::New(env, castString));
    exports.Set("BFNumber", Function::New(env, BufferFromNumber));

    return exports;
}

NODE_API_MODULE(addon, Init);
