// cl.exe /MT /EHsc /std:c++17 /O2 e3repsym.cpp

#include <cstddef>
#include <fstream>
#include <iostream>
#include <memory>
#include <string>
#include <string_view>

using namespace std::literals;


int xwmain(int argc, wchar_t* argv[]) {
  if (argc < 2) {
    std::wcerr << L"usage: "sv << argv[0] << L" path/to/decimagea.obj"sv << std::endl;
    return 2;
  }

  const std::wstring filePath = argv[1];

  const std::string from = "_m_pfnColorOperation@ERISADecoder@@1QBQ81@AEXXZB"s;
  const std::string to   = "?m_pfnColorOperation@ERISADecoder@@1QBQ81@AEXXZB"s;

  std::ifstream ifs(filePath, std::ios::binary);
  ifs.exceptions(std::ios::badbit | std::ios::failbit);
  ifs.seekg(0, std::ios::end);
  const auto dataSize = static_cast<std::size_t>(ifs.tellg());
  ifs.seekg(0, std::ios::beg);
  auto data = std::make_unique<char[]>(dataSize);
  ifs.read(data.get(), dataSize);
  ifs.close();

  std::string str(data.get(), dataSize);
  std::size_t offset = 0;
  bool symbolFound = false;
  while ((offset = str.find(from, offset)) != std::string::npos) {
    str.replace(offset, from.size(), to);
    offset += to.size();
    symbolFound = true;
  }
  
  if (!symbolFound) {
    const auto offsetTo = str.find(to);
    if (offsetTo != std::string::npos) {
      std::wcerr << L"already patched"sv << std::endl;
      return 0;
    }
    
    std::wcerr << L"symbol not found"sv << std::endl;
    return 3;
  }

  std::ofstream ofs(filePath, std::ios::binary);
  ofs.exceptions(std::ios::badbit | std::ios::failbit);
  ofs.write(str.c_str(), str.size());
  ofs.close();
  
  return 0;
}


int wmain(int argc, wchar_t* argv[]) {
  try {
    return xwmain(argc, argv);
  } catch (std::exception exception) {
    std::cerr << exception.what() << std::endl;
    return 1;
  } catch (...) {
    std::wcerr << L"an error occurred"sv << std::endl;
    return 1;
  }
}
