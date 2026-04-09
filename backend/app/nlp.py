import re

CATEGORIES = {
    "delivery": ["доставка", "курьер", "транспорт", "сдэк", "почта", "логистика", "перевозка"],
    "packaging": ["упаковка", "коробка", "пакет", "скотч", "бирка", "этикетка", "пупырка", "тара"],
    "workers": ["рабочий", "зарплата", "оплата", "сборка", "фасовка", "труд", "упаковщик", "бригада"],
    "design": ["дизайн", "логотип", "графика", "верстка", "макет", "фото", "съемка", "визуал"],
    "warehouse": ["хранение", "склад", "аренда склада", "складирование", "ответственное хранение", "фулфилмент"],
}

def parse_expenses_text(text: str) -> dict[str, float]:
    result = {"delivery": 0.0, "packaging": 0.0, "workers": 0.0, "design": 0.0, "warehouse": 0.0, "other": 0.0}
    for line in text.splitlines():
        match = re.search(r"(\d+(?:[.,]\d+)?)", line.lower())
        if not match:
            continue
        amount = float(match.group(1).replace(",", "."))
        if amount <= 0:
            continue
        
        categorized = False
        for cat, keywords in CATEGORIES.items():
            if any(kw in line.lower() for kw in keywords):
                result[cat] += amount
                categorized = True
                break
        if not categorized:
            result["other"] += amount
    return result
