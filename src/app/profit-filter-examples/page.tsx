'use client'

import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Info, TrendingUp, Trophy, Zap, Target, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const profitLevels = [
  { value: 0, label: 'Все ставки', icon: '📊', color: 'text-gray-600', description: 'Показать все матчи' },
  { value: 0.02, label: 'Минимальная', icon: '⚖️', color: 'text-blue-600', description: 'Выгода от 2%' },
  { value: 0.08, label: 'Хорошая', icon: '✅', color: 'text-green-600', description: 'Выгода от 8%' },
  { value: 0.15, label: 'Отличная', icon: '🎯', color: 'text-orange-600', description: 'Выгода от 15%' }
]

export default function ProfitFilterExamplesPage() {
  const [slider1Value, setSlider1Value] = useState([0])
  const [slider2Value, setSlider2Value] = useState([0])
  const [buttonValue, setButtonValue] = useState(0)
  const [cardValue, setCardValue] = useState(0)
  const [dropdownValue, setDropdownValue] = useState('0')
  const [tabValue, setTabValue] = useState('0')
  const [switchValue, setSwitchValue] = useState(false)
  const [rangeValue, setRangeValue] = useState([0, 100])

  return (
    <div className="container mx-auto p-6 space-y-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Варианты фильтра выгодных ставок</h1>
        <p className="text-muted-foreground">Выберите наиболее удобный вариант интерфейса</p>
      </div>

      {/* Вариант 1: Улучшенный слайдер с визуальными индикаторами */}
      <Card>
        <CardHeader>
          <CardTitle>Вариант 1: Слайдер с визуальными маркерами</CardTitle>
          <CardDescription>Плавная настройка с подсказками и цветовой индикацией</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Минимальная выгода</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Показывает только ставки, где коэффициент букмекера</p>
                    <p>выше прогноза ML на указанный процент</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-3">
              <Slider
                value={slider1Value}
                onValueChange={setSlider1Value}
                max={20}
                step={1}
                className="relative"
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Все</span>
                <span>5%</span>
                <span>10%</span>
                <span>15%</span>
                <span>20%</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">
                  {slider1Value[0] === 0 ? 'Показаны все матчи' : `Выгода от ${slider1Value[0]}%`}
                </span>
                <Badge variant={slider1Value[0] >= 15 ? 'default' : slider1Value[0] >= 8 ? 'secondary' : 'outline'}>
                  {slider1Value[0] === 0 ? '📊 Все' : slider1Value[0] >= 15 ? '🎯 Отличные' : slider1Value[0] >= 8 ? '✅ Хорошие' : '⚖️ Базовые'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Вариант 2: Группа кнопок */}
      <Card>
        <CardHeader>
          <CardTitle>Вариант 2: Быстрый выбор кнопками</CardTitle>
          <CardDescription>Простой и понятный выбор одним кликом</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label className="text-base font-medium">Уровень выгоды</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {profitLevels.map((level) => (
              <Button
                key={level.value}
                variant={buttonValue === level.value ? 'default' : 'outline'}
                onClick={() => setButtonValue(level.value)}
                className="h-auto flex-col py-3"
              >
                <span className="text-2xl mb-1">{level.icon}</span>
                <span className="text-sm font-medium">{level.label}</span>
                <span className="text-xs text-muted-foreground">{level.description}</span>
              </Button>
            ))}
          </div>
          {buttonValue > 0 && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ Показаны только выгодные ставки с преимуществом от {buttonValue * 100}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Вариант 3: Карточки с описанием */}
      <Card>
        <CardHeader>
          <CardTitle>Вариант 3: Информативные карточки</CardTitle>
          <CardDescription>Подробное описание каждого уровня</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {profitLevels.map((level) => (
              <Card
                key={level.value}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  cardValue === level.value && "ring-2 ring-primary"
                )}
                onClick={() => setCardValue(level.value)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{level.icon}</span>
                    {cardValue === level.value && (
                      <Badge variant="default" className="text-xs">Выбрано</Badge>
                    )}
                  </div>
                  <CardTitle className="text-base">{level.label}</CardTitle>
                  <CardDescription className="text-xs">
                    {level.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Вариант 4: Выпадающий список с превью */}
      <Card>
        <CardHeader>
          <CardTitle>Вариант 4: Компактный выпадающий список</CardTitle>
          <CardDescription>Экономит место, подходит для мобильных устройств</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Фильтр по выгоде</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    {profitLevels.find(l => l.value.toString() === dropdownValue)?.icon}
                    {profitLevels.find(l => l.value.toString() === dropdownValue)?.label}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuLabel>Выберите уровень выгоды</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={dropdownValue} onValueChange={setDropdownValue}>
                  {profitLevels.map((level) => (
                    <DropdownMenuRadioItem key={level.value} value={level.value.toString()} className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{level.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium">{level.label}</div>
                          <div className="text-xs text-muted-foreground">{level.description}</div>
                        </div>
                      </div>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Текущий фильтр:</span>
              <Badge variant="outline">
                {profitLevels.find(l => l.value.toString() === dropdownValue)?.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {dropdownValue === '0'
                ? 'Отображаются все матчи без фильтрации по выгоде'
                : `Отображаются только матчи с выгодой от ${parseFloat(dropdownValue) * 100}%`
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Вариант 5: Вкладки */}
      <Card>
        <CardHeader>
          <CardTitle>Вариант 5: Навигация вкладками</CardTitle>
          <CardDescription>Четкое разделение по категориям</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tabValue} onValueChange={setTabValue}>
            <TabsList className="grid w-full grid-cols-4">
              {profitLevels.map((level) => (
                <TabsTrigger key={level.value} value={level.value.toString()} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <span className="hidden md:inline mr-2">{level.icon}</span>
                  <span className="text-xs md:text-sm">{level.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {profitLevels.map((level) => (
              <TabsContent key={level.value} value={level.value.toString()} className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{level.icon}</span>
                      {level.label}
                    </CardTitle>
                    <CardDescription>{level.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={level.color}>
                          {level.value === 0 ? 'Без фильтра' : `Мин. ${level.value * 100}%`}
                        </Badge>
                        {level.value > 0 && (
                          <span className="text-sm text-muted-foreground">
                            преимущества над линией букмекера
                          </span>
                        )}
                      </div>
                      {level.value === 0 && (
                        <p className="text-sm text-muted-foreground">
                          Показаны все доступные матчи. Используйте другие вкладки для фильтрации по выгоде.
                        </p>
                      )}
                      {level.value === 0.02 && (
                        <p className="text-sm text-muted-foreground">
                          Базовый уровень фильтрации. Подходит для осторожных игроков.
                        </p>
                      )}
                      {level.value === 0.08 && (
                        <p className="text-sm text-muted-foreground">
                          Оптимальный баланс между количеством ставок и их выгодностью.
                        </p>
                      )}
                      {level.value === 0.15 && (
                        <p className="text-sm text-muted-foreground">
                          Только самые выгодные предложения с максимальным преимуществом.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Вариант 6: Переключатель + слайдер */}
      <Card>
        <CardHeader>
          <CardTitle>Вариант 6: Комбинированный подход</CardTitle>
          <CardDescription>Быстрое включение/выключение + точная настройка</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label htmlFor="profit-mode" className="text-base font-medium">
                Режим выгодных ставок
              </Label>
              <p className="text-sm text-muted-foreground">
                Показывать только ставки с положительным математическим ожиданием
              </p>
            </div>
            <Switch
              id="profit-mode"
              checked={switchValue}
              onCheckedChange={setSwitchValue}
            />
          </div>

          {switchValue && (
            <div className="space-y-4 p-4 rounded-lg bg-muted/50 animate-in slide-in-from-top-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Уровень выгоды: {slider2Value[0]}%</Label>
                <Slider
                  value={slider2Value}
                  onValueChange={setSlider2Value}
                  max={30}
                  step={1}
                  className="relative"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Любая</span>
                  <span>10%</span>
                  <span>20%</span>
                  <span>30%</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSlider2Value([5])}
                  className="text-xs"
                >
                  ⚖️ Консервативно (5%)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSlider2Value([10])}
                  className="text-xs"
                >
                  ✅ Оптимально (10%)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSlider2Value([20])}
                  className="text-xs"
                >
                  🎯 Агрессивно (20%)
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Вариант 7: Диапазон с двумя ползунками */}
      <Card>
        <CardHeader>
          <CardTitle>Вариант 7: Диапазон выгоды</CardTitle>
          <CardDescription>Точная настройка минимального и максимального уровня</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Диапазон выгоды</Label>
              <Badge variant="outline">
                {rangeValue[0]}% - {rangeValue[1]}%
              </Badge>
            </div>

            <Slider
              value={rangeValue}
              onValueChange={setRangeValue}
              max={100}
              step={5}
              minStepsBetweenThumbs={5}
              className="relative"
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">Минимум</p>
                <p className="text-lg font-semibold">{rangeValue[0]}%</p>
              </div>
              <div className="p-3 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">Максимум</p>
                <p className="text-lg font-semibold">{rangeValue[1]}%</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRangeValue([0, 100])}
                className="text-xs"
              >
                Все
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRangeValue([5, 15])}
                className="text-xs"
              >
                Безопасные
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRangeValue([10, 30])}
                className="text-xs"
              >
                Оптимальные
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRangeValue([20, 100])}
                className="text-xs"
              >
                Высокие
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Вариант 8: Прогрессивные индикаторы */}
      <Card>
        <CardHeader>
          <CardTitle>Вариант 8: Визуальная шкала выгоды</CardTitle>
          <CardDescription>Наглядное отображение уровней с прогресс-барами</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {profitLevels.map((level, index) => (
              <div
                key={level.value}
                className={cn(
                  "p-4 rounded-lg border-2 cursor-pointer transition-all",
                  buttonValue >= level.value
                    ? "border-primary bg-primary/5"
                    : "border-transparent bg-muted/50 hover:bg-muted"
                )}
                onClick={() => setButtonValue(level.value)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{level.icon}</span>
                    <div>
                      <p className="font-medium">{level.label}</p>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                    </div>
                  </div>
                  {buttonValue >= level.value && (
                    <Badge variant="default">Активно</Badge>
                  )}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      index === 0 && "bg-gray-400 w-1/4",
                      index === 1 && "bg-blue-500 w-2/4",
                      index === 2 && "bg-green-500 w-3/4",
                      index === 3 && "bg-orange-500 w-full"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Итоговые рекомендации */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle>Рекомендации по выбору</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <Badge variant="outline" className="mt-1">Mobile</Badge>
              <div>
                <p className="font-medium">Для мобильных устройств</p>
                <p className="text-sm text-muted-foreground">
                  Варианты 2 (кнопки), 4 (dropdown) или 6 (переключатель) - компактные и удобные для тач-управления
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Badge variant="outline" className="mt-1">Desktop</Badge>
              <div>
                <p className="font-medium">Для десктопа</p>
                <p className="text-sm text-muted-foreground">
                  Варианты 1 (слайдер), 3 (карточки) или 5 (вкладки) - используют больше пространства для лучшей информативности
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Badge variant="outline" className="mt-1">Simple</Badge>
              <div>
                <p className="font-medium">Для простоты</p>
                <p className="text-sm text-muted-foreground">
                  Вариант 2 (кнопки) - самый простой и понятный, подходит для новичков
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Badge variant="outline" className="mt-1">Pro</Badge>
              <div>
                <p className="font-medium">Для продвинутых</p>
                <p className="text-sm text-muted-foreground">
                  Варианты 6 (комбинированный) или 7 (диапазон) - максимальная гибкость настроек
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}