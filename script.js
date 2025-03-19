// CSVファイルからポケモンデータを読み込むメインスクリプト
document.addEventListener('DOMContentLoaded', () => {
    const pokemonForm = document.getElementById('pokemon-form');
    const pokemonNameInput = document.getElementById('pokemon-name');
    const pokemonInfoDiv = document.getElementById('pokemon-info');
    const errorMessageDiv = document.getElementById('error-message');
    const loadingDiv = document.getElementById('loading');
    const pokemonCountSpan = document.getElementById('pokemon-count');
    
    // グローバル変数としてマッピングデータを保持
    let pokemonNameMapping = {};
    
    // タイプ名の英語から日本語への変換辞書
    const typeTranslations = {
        "normal": "ノーマル",
        "fire": "ほのお",
        "water": "みず",
        "electric": "でんき",
        "grass": "くさ",
        "ice": "こおり",
        "fighting": "かくとう",
        "poison": "どく",
        "ground": "じめん",
        "flying": "ひこう",
        "psychic": "エスパー",
        "bug": "むし",
        "rock": "いわ",
        "ghost": "ゴースト",
        "dragon": "ドラゴン",
        "dark": "あく",
        "steel": "はがね",
        "fairy": "フェアリー"
    };
    
    // ページ読み込み時にCSVファイルからデータを読み込む
    loadPokemonData()
        .then(mapping => {
            pokemonNameMapping = mapping;
            // 登録されているポケモン数を表示
            pokemonCountSpan.textContent = Object.keys(mapping).length;
            console.log('ポケモンデータの読み込みが完了しました');
        })
        .catch(error => {
            console.error('データの読み込みに失敗しました:', error);
            showError('ポケモンデータの読み込みに失敗しました。ページを更新してください。');
        });
    
    // フォーム送信イベントのリスナー
    pokemonForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // 入力値を取得して前後の空白を削除
        const pokemonName = pokemonNameInput.value.trim();
        
        // 入力が空の場合は処理しない
        if (!pokemonName) {
            showError('ポケモン名を入力してください');
            return;
        }
        
        // UI状態をリセット
        resetUI();
        
        // ローディング表示
        loadingDiv.style.display = 'block';
        
        try {
            // ポケモン情報を取得
            const pokemonInfo = await getPokemonInfo(pokemonName);
            
            // 結果を表示
            displayPokemonInfo(pokemonInfo);
        } catch (error) {
            showError(error.message);
        } finally {
            // ローディング非表示
            loadingDiv.style.display = 'none';
        }
    });
    
    // CSVファイルからポケモンデータを読み込む関数
    async function loadPokemonData() {
        try {
            // 直接JavaScriptにデータを埋め込む方法（ファイル読み込みが失敗する場合の代替手段）
            const csvData = `1\tフシギダネ\tBulbasaur
2\tフシギソウ\tIvysaur
3\tフシギバナ\tVenusaur
3\tメガフシギバナ\tMega Venusaur
4\tヒトカゲ\tCharmander
5\tリザード\tCharmeleon
6\tリザードン\tCharizard
6\tメガリザードンX\tMega Charizard X
6\tメガリザードンY\tMega Charizard Y
7\tゼニガメ\tSquirtle
8\tカメール\tWartortle
9\tカメックス\tBlastoise
9\tメガカメックス\tMega Blastoise
10\tキャタピー\tCaterpie
11\tトランセル\tMetapod
12\tバタフリー\tButterfree
13\tビードル\tWeedle
14\tコクーン\tKakuna
15\tスピアー\tBeedrill
15\tメガスピアー\tMega Beedrill
16\tポッポ\tPidgey
17\tピジョン\tPidgeotto
18\tピジョット\tPidgeot
18\tメガピジョット\tMega Pidgeot
19\tコラッタ\tRattata
19\tコラッタ(アローラ)\tRattata Alola
20\tラッタ\tRaticate
20\tラッタ(アローラ)\tRaticate Alola
21\tオニスズメ\tSpearow
22\tオニドリル\tFearow
23\tアーボ\tEkans
24\tアーボック\tArbok
25\tピカチュウ\tPikachu
25\tそらをとぶピカチュウ\tPikachu Costume 2020
25\tピカチュウ(キャプテン)\tPikachu Horizons
25\tかりゆしピカチュウ\tPikachu Kariyushi
25\tマスクド・ピカチュウ\tPikachu (VS 2019)
25\tドクター・ピカチュウ\tPikachu Doctor
25\tピカチュウ(ハードロック)\tPikachu Rock Star
25\tピカチュウ(アイドル)\tPikachu Pop Star
26\tライチュウ\tRaichu
26\tライチュウ(アローラ)\tRaichu Alola
27\tサンド\tSandshrew
27\tサンド(アローラ)\tSandshrew Alola
28\tサンドパン\tSandslash
28\tサンドパン(アローラ)\tSandslash Alola
29\tニドラン♀\tNidoran(Female)
30\tニドリーナ\tNidorina
31\tニドクイン\tNidoqueen
32\tニドラン♂\tNidoran(Male)
33\tニドリーノ\tNidorino
34\tニドキング\tNidoking
35\tピッピ\tClefairy
36\tピクシー\tClefable
37\tロコン\tVulpix
37\tロコン(アローラ)\tVulpix Alola
38\tキュウコン\tNinetales
38\tキュウコン(アローラ)\tNinetales Alola
39\tプリン\tJigglypuff
40\tプクリン\tWigglytuff
41\tズバット\tZubat
42\tゴルバット\tGolbat
43\tナゾノクサ\tOddish
44\tクサイハナ\tGloom
45\tラフレシア\tVileplume
46\tパラス\tParas
47\tパラセクト\tParasect
48\tコンパン\tVenonat
49\tモルフォン\tVenomoth
50\tディグダ\tDiglett
50\tディグダ(アローラ)\tDiglett Alola`;
            
            // マッピング用の辞書を初期化
            const mapping = {};
            
            // 各行を処理
            const lines = csvData.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    // タブで区切られているデータを分割
                    const [no, jaName, enName] = line.split('\t');
                    
                    // 英語名をAPI用に整形（小文字に変換し、スペースをハイフンに置き換える）
                    if (jaName && enName) {
                        const apiName = formatNameForApi(enName);
                        mapping[jaName] = apiName;
                    }
                }
            }
            
            return mapping;
        } catch (error) {
            console.error('ポケモンデータの読み込みに失敗しました:', error);
            throw error;
        }
    }
    
    // 英語名をAPI用にフォーマットする関数
    function formatNameForApi(name) {
        // 括弧内の文字を除去する正規表現
        const bracketContent = /\([^)]*\)/g;
        
        // 特殊文字を除去または置換
        return name
            .toLowerCase()
            .replace(bracketContent, '')
            .replace(/\s+/g, '-')     // スペースをハイフンに置換
            .replace(/[.:]/g, '')      // ピリオドやコロンを除去
            .replace(/[♂♀]/g, '')     // 性別記号を除去
            .replace(/\s*-\s*/g, '-') // ハイフン周りのスペースを整理
            .replace(/\s+/g, '-')     // 残りのスペースをハイフンに置換
            .trim();                   // 前後の空白を除去
    }
    
    // ポケモン情報を取得する関数
    async function getPokemonInfo(pokemonName) {
        // 日本語名を英語名に変換（辞書にある場合）
        let englishName = pokemonNameMapping[pokemonName];
        
        // 辞書に名前が見つからない場合
        if (!englishName) {
            // 完全一致の代わりに部分一致で検索
            const keys = Object.keys(pokemonNameMapping);
            for (const key of keys) {
                if (key.includes(pokemonName)) {
                    englishName = pokemonNameMapping[key];
                    break;
                }
            }
            
            // それでも見つからない場合は、入力された名前をそのまま使用
            if (!englishName) {
                englishName = formatNameForApi(pokemonName);
            }
        }
        
        const url = `https://pokeapi.co/api/v2/pokemon/${englishName}`;
        
        try {
            const response = await fetch(url);
            
            // ステータスコードが200でない場合、エラーをスロー
            if (!response.ok) {
                throw new Error(`ポケモンが見つかりませんでした。正しいポケモン名を入力してください。`);
            }
            
            const data = await response.json();
            
            // タイプ名を日本語に変換
            const translatedTypes = data.types.map(t => {
                const typeName = t.type.name;
                return typeTranslations[typeName] || typeName;
            });
            
            // データを整形して返す
            return {
                name: data.name,
                japaneseName: pokemonName, // 入力された日本語名
                height: (data.height / 10).toFixed(1), // mに変換して小数点第一位まで表示
                weight: (data.weight / 10).toFixed(1), // kgに変換して小数点第一位まで表示
                types: translatedTypes,
                abilities: data.abilities.map(a => a.ability.name),
                id: data.id,
                sprites: data.sprites.front_default
            };
        } catch (error) {
            throw error;
        }
    }
    
    // ポケモン情報を表示する関数
    function displayPokemonInfo(pokemon) {
        // 結果表示エリアをクリア
        pokemonInfoDiv.innerHTML = '';
        
        // 日本語名と英語名を表示するヘッダーを作成
        const nameHeader = document.createElement('h2');
        nameHeader.textContent = `${pokemon.name} (${pokemon.japaneseName})`;
        
        // 詳細情報を表示するコンテナを作成
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'pokemon-details';
        
        // スプライト画像を追加（存在する場合）
        if (pokemon.sprites) {
            const spriteDiv = document.createElement('div');
            spriteDiv.className = 'pokemon-sprite';
            
            const spriteImg = document.createElement('img');
            spriteImg.src = pokemon.sprites;
            spriteImg.alt = pokemon.name;
            
            spriteDiv.appendChild(spriteImg);
            detailsContainer.appendChild(spriteDiv);
        }
        
        // 情報コンテナ
        const infoContainer = document.createElement('div');
        infoContainer.className = 'pokemon-info-container';
        
        // 高さの情報を追加
        const heightDiv = createDetailItem('高さ', `${pokemon.height} m`);
        
        // 重さの情報を追加
        const weightDiv = createDetailItem('重さ', `${pokemon.weight} kg`);
        
        // タイプの情報を追加
        const typesDiv = document.createElement('div');
        typesDiv.className = 'pokemon-detail-item';
        
        const typesTitle = document.createElement('h3');
        typesTitle.textContent = 'タイプ';
        
        const typesList = document.createElement('div');
        typesList.className = 'types-list';
        
        pokemon.types.forEach(type => {
            const typeBadge = document.createElement('span');
            typeBadge.className = 'type-badge';
            typeBadge.textContent = type;
            typesList.appendChild(typeBadge);
        });
        
        typesDiv.appendChild(typesTitle);
        typesDiv.appendChild(typesList);
        
        // 特性の情報を追加
        const abilitiesDiv = document.createElement('div');
        abilitiesDiv.className = 'pokemon-detail-item';
        
        const abilitiesTitle = document.createElement('h3');
        abilitiesTitle.textContent = '特性';
        
        const abilitiesList = document.createElement('div');
        abilitiesList.className = 'abilities-list';
        
        pokemon.abilities.forEach(ability => {
            const abilityBadge = document.createElement('span');
            abilityBadge.className = 'ability-badge';
            abilityBadge.textContent = ability;
            abilitiesList.appendChild(abilityBadge);
        });
        
        abilitiesDiv.appendChild(abilitiesTitle);
        abilitiesDiv.appendChild(abilitiesList);
        
        // 図鑑番号の情報を追加
        const idDiv = createDetailItem('図鑑番号', `No.${pokemon.id}`);
        
        // 情報要素をコンテナに追加
        infoContainer.appendChild(heightDiv);
        infoContainer.appendChild(weightDiv);
        infoContainer.appendChild(typesDiv);
        infoContainer.appendChild(abilitiesDiv);
        infoContainer.appendChild(idDiv);
        
        // 詳細コンテナに情報コンテナを追加
        detailsContainer.appendChild(infoContainer);
        
        // 結果表示エリアに追加
        pokemonInfoDiv.appendChild(nameHeader);
        pokemonInfoDiv.appendChild(detailsContainer);
        
        // 結果表示エリアを表示
        pokemonInfoDiv.style.display = 'block';
    }
    
    // 詳細項目を作成するヘルパー関数
    function createDetailItem(title, value) {
        const detailDiv = document.createElement('div');
        detailDiv.className = 'pokemon-detail-item';
        
        const detailTitle = document.createElement('h3');
        detailTitle.textContent = title;
        
        const detailValue = document.createElement('p');
        detailValue.textContent = value;
        
        detailDiv.appendChild(detailTitle);
        detailDiv.appendChild(detailValue);
        
        return detailDiv;
    }
    
    // エラーメッセージを表示する関数
    function showError(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    }
    
    // UI状態をリセットする関数
    function resetUI() {
        errorMessageDiv.style.display = 'none';
        pokemonInfoDiv.style.display = 'none';
    }
});
