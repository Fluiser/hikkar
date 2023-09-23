#define NAPI_CPP_EXCEPTIONS
#include <napi.h>
#include <string>

using namespace Napi;

Array parse(const CallbackInfo& args)
{
    Array array = Array::New(args.Env());
    std::string input = args[0].As<String>().Utf8Value();
    std::string str;
    str.reserve(1024);

    for(size_t i = 0, last_index = 0, tokenIndex = 0; i < input.size(); ++i)
    {
        char& s = input[i];
        char& prevS = input[i-1];

        if(s == '{' && prevS != '\\') {
            ++tokenIndex;
        }
        if(s == '}' && prevS != '\\') {
            if(!--tokenIndex) {
                str.push_back(s);
                array.Set(last_index++, str);
                str.clear();
            }
        }
        if(tokenIndex) str.push_back(s);
    }
    return array;
}

Object getTokens(const CallbackInfo& args)
{
    Object index = Object::New(args.Env());
    std::string str = args[0].As<String>().Utf8Value();
    size_t sizeStr = str.size();

    std::string key{""};
    std::string value{""};
    key.reserve(64);
    value.reserve(256);

    std::string* field = &key;
    for(size_t i = 1, tokenindex = 1; i < sizeStr; ++i)
    {
        char& c = str[i];
        char& prev = str[i];

        if(c == '{' && prev != '\\') ++tokenindex;
        if(c == '}' && prev != '\\' && !--tokenindex) break;

        if(c == ':' && field == &key) field = &value;
        else if(tokenindex) field->push_back(c);

    }

    index.Set("key", key);
    index.Set("value", value);
    return index;
}

Object Init(Env env, Object exports)
{
    exports.Set("parse", Function::New(env, parse));
    exports.Set("getTokens", Function::New(env, getTokens));
    return exports;
}

NODE_API_MODULE(addon, Init);