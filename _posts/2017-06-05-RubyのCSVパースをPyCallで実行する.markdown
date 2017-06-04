---
layout: post
title: "RubyのCSVパースをPyCallで実行する (ベンチマーク)"
category: F
tags: ruby,benchmark,pycall
cover: false
cover-image:
---

# PROBLEM
- 大量のCSVを読み込む際、毎回時間がかかる

-

# SOLUTION
というわけで、[Dalibor Nasevicのベンチマーク記事](https://dalibornasevic.com/posts/68-processing-large-csv-files-with-ruby)にPyCallのベンチマークをくわえて比較してみることに。記事では `CSV.foreach` が速いとの結論だった。

| kind_of_parse                      | time (real) | memory (MB) |
|------------------------------------+-------------+-------------|
| 1. `CSV.read`                      |       39.13 |       866.6 |
| 2. `CSV.parse`                     |       36.16 |      936.87 |
| 3. line by line from String Object |       23.39 |       73.42 |
| 4. line by line from IO Object     |       24.55 |         0.0 |
| 5. `CSV.foreach`                   |       24.04 |         0.0 |

## PyCallのベンチマーク
コードはこんな感じ。

```ruby
require_relative './helpers'
require 'pycall/import'
include PyCall::Import
pyimport :pandas, as: :pd

print_memory_usage do
  print_time_spent do
    csv = pd.read_csv.('data.csv')
    sum = csv['id'].sum.()
    puts "Sum: #{sum}"
  end
end
```

`pyenv` との相性が悪いのでSystemインストールしたPythonでたたく。

```sh
$ PYTHON=/usr/bin/python3.4 ruby parse_6_pycall.rb
Sum: 499999500000
Time: 1.49
Memory: 54.99 MB
```

**結果**

| kind_of_parse                      | time (real) | memory (MB) |
|------------------------------------+-------------+-------------|
| 1. `CSV.read`                      |       39.13 |       866.6 |
| 2. `CSV.parse`                     |       36.16 |      936.87 |
| 3. line by line from String Object |       23.39 |       73.42 |
| 4. line by line from IO Object     |       24.55 |         0.0 |
| 5. `CSV.foreach`                   |       24.04 |         0.0 |
| 6. PyCall                          |        1.49 |       54.99 |

16倍の実行速度、

つかえそう。

ただ、PyCallのオブジェクトは `PyObject` なので、
Railsだとまだ相性がわるいかなあ。

-

以上 :construction_worker:
