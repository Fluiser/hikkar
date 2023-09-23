#include <vector>
#include <string>
#include <memory>

enum _TOKEN {
    PLUS,
    MINUS,
    MULTI,
    DIVIDE,
    ARRAY_OPEN,
    ARRAY_CLOSE,
    STRING_OPEN,
    STRING_CLOSE,
    OBJECT_OPEN,
    OBJECT_CLOSE
};

struct TOKEN {
    _TOKEN type = _TOKEN::UNKNOWN;
    std::unique_ptr<char**> args; // ptr to ptr char arguments
};

class token {
    std::vector<TOKEN> tokens;
public:
    token() noexcept {}
    ~token() noexcept {}
};