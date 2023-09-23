// Оно работало, пока это я не решил переписать.
// По итогу оно полностью не работает и не переписано.
// Да и уже и не надо.
#define NAPI_CPP_EXCEPTIONS

#include <napi.h>
#include <stdlib.h>
#include <string>
#include <stdio.h>
#include <string>
#include <map>
#include <vector>

namespace UserScript {
    struct String {
        const char* ptr = nullptr;
        size_t size = 0;
    };

    class Lexeme {
    public:
        enum statuses {
            MISSING_OPERATOR, // {{{{}
            NO_EXECUTE_OPERATOR, // No $
            OK_VALUE, // ${func: arg}
            OK_WVALUE // without value (${macros})
        };

        String data;
        int pdval = -1;

        statuses parse(const char* string, size_t size)
        {
            size_t i = 0;
            {
                bool hasExecutableOperator = false;
                unsigned operators = 0;
                for(; i < size; ++i)
                {
                    if(!hasExecutableOperator && (string[i] != '$' || (i < (size-1) && string[i+1] != '{') ) ) continue;
                    else if(!hasExecutableOperator) {
                        data.ptr = string + i;
                        hasExecutableOperator = true;
                    }
                    if(string[i] == '{') ++operators;
                    if(operators != 0)
                        ++data.size;
                    if(string[i] == '}' && --operators == 0) break;
                }

                if(operators != 0) return MISSING_OPERATOR;
                if(!hasExecutableOperator) return NO_EXECUTE_OPERATOR;
            }

            for(size_t i = 0; i < data.size; ++i)
            {
                if(data.ptr[i] == ':')
                {
                    pdval = i;
                    break;
                }
            }

            return (pdval == -1 ? OK_WVALUE : OK_VALUE);
        }

        String get_instruction() const
        {
            String s;
            s.ptr = (data.ptr + 2);
            s.size = (pdval == -1 ? data.size : pdval+1);
            return s;
        }

        String get_value() const
        {
            String s;
            if(pdval == -1) return s;
            s.ptr = (data.ptr + pdval + 1);
            s.size = data.size;
            return s;
        }

        void debug() const
        {
            printf("data.ptr[%u]: \"", data.size);
            if(data.ptr != nullptr)
                for(size_t i = 0; i <= data.size; ++i)
                    printf("%c", data.ptr[i]);
            printf("\"\n");
            printf("key: ");
            for(long i = 2; i < (pdval == -1 ? data.size : pdval); ++i)
            {
                printf("%c", data.ptr[i]);
            }
            printf("\nv:");
            if(pdval != -1)
                for(long i = pdval+1; i < data.size; ++i)
                {
                    printf("%c", data.ptr[i]);
                }
            printf("\n");
        }

    };
}

void find_all_lexemes(const char* begin, size_t size, std::vector<UserScript::Lexeme>& lexemes)
{
    const char* end = begin+size;
    while(begin < end)
    {
        UserScript::Lexeme lexeme;
        lexeme.parse(begin, (end-begin));
        if(lexeme.data.ptr)
        {
            lexemes.emplace_back(lexeme);
            begin = begin + lexeme.data.size;
        }
        else {
            break;
        }
    }
}

void find_childrens(UserScript::String input, std::vector<UserScript::Lexeme>& lexemes)
{
    std::vector<UserScript::Lexeme> find;
    find_all_lexemes(input.ptr, input.size, find);
    if(find.size())
    {
        lexemes.insert(lexemes.end(), find.begin(), find.end());
        for(const auto& l: find)
        {
            find_childrens(l.get_value(), lexemes);
        }
    }
}

void struct_pathology(const std::string& input, std::map<UserScript::Lexeme, std::vector<UserScript::Lexeme>>& base)
{
    //<parentLexeme, childLexeme>

    //collect parents
    {
        std::vector<UserScript::Lexeme> parents{};
        find_all_lexemes(input.c_str(), input.size(), parents);
        for(auto& p: parents)
        {
            base[p] = std::vector<UserScript::Lexeme>{};
        }
    }

    //collect childrens
    for(auto& pair: base)
    {
        for(const auto& c: pair.second)
        {
            find_childrens(c.get_value(), pair.second);
        }
    }
}

// Construct from pathology family -> string. User napi::Object - it's env.:
void test(Napi::CallbackInfo& callback)
{
    Napi::String str = callback.args[0].As<Napi::String>();
    std::string input = str.Utf8Value();
    std::map<UserScrupt::Lexeme, std::vector<UserScript::Lexeme>> system;
    struct_pathology(input, system);
    std::cout << "SYSTEM.SIZE = " << system.size() << "\n";
    for(const auto& pair: system)
    {
        pair.first.debug();
        printf("\n----------------------------\n");
        for(const auto& lexeme: pair.second)
        {
            lexeme.debug();
            printf("\n");
        }
        printf("\n");
    }
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    exports.Set("test", Function::New(env, test));
    return exports;
}

NODE_API_MODULE(addon, Init);
