#include <stdint.h>
#include <iostream>
#include <string>
#include <cmath>

namespace {
static const char stack[] = "0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
constexpr int stack_size = sizeof(stack)-1;
}

template<class T = long long>
void destHex(T n, std::string& str)
{
    std::string c_str;
    while(n != 0)
    {
        c_str.push_back(stack[n%stack_size]);
        n /= stack_size;
    }
    for(int i = c_str.size()-1; i >= 0; --i)
    {
        str.push_back(c_str[i]);
    }
}

template<class T = long long>
T extrHex(const std::string& str) noexcept
{
    T n = 0;
    int null = -1;
#ifndef SKIP_NULL
    for(size_t i = 0; i < str.size(); ++i)
        if(str[i] == '.') {
            null = i;
            break;
        }
#endif
    if(null > -1) {
        for(int i = str.size(); i >= 0; --i)
        {
            if(str[i]-'0' < 0 || str[i]-'0' > stack_size) continue;
            n += (str[i]-'0')*pow(stack_size, i-null);
        }
    } else {
        size_t size = str.size()-1;
        for(size_t i = 0; i <= size; ++i)
        {
            if(str[i]-'0' < 0 || str[i]-'0' > stack_size) continue;
            n += ((str[i]-'0')*pow(stack_size, size-i));
        }
    }
    if(str[0] == '-') return n*-1;
    else return n;
}
