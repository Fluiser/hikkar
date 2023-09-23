#define NAPI_CPP_EXCEPTIONS
#include <napi.h>
#include <chrono>
#include <thread>
#include <iostream>
using namespace Napi;

void sleep(const CallbackInfo& args)
{
    if(!args.Length()) napi_throw_error(args.Env(), NULL, "Not defined need arguments");
    int32_t time = args[0].As<Number>().Int32Value();
#ifdef DEBUG_MODE
    std::cout << "[SYSTEM]: SLEEP THREAD: " << std::this_thread::get_id() << "\tTIME:" << time << "\n";
#endif
    std::this_thread::sleep_for(std::chrono::milliseconds(time));
}

Object Init(Env env, Object exports)
{
    //exports.Set("sleep", Function::New(env, sleep));
    exports = Function::New(env, sleep);
    return exports;
}

NODE_API_MODULE(addon, Init);