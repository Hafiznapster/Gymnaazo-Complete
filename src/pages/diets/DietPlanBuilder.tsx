// @ts-nocheck
import { useState } from 'react'
import {
  Box, Typography, Stack, Card, CardContent, Button,
  TextField, IconButton, Divider, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, Autocomplete
} from '@mui/material'
import {
  Add, Delete, Save, DragIndicator
} from '@mui/icons-material'

const FOOD_LIBRARY = [
  { id: '1', name: 'Oats (raw)', calories: 389, protein: 16.9, carbs: 66.3, fats: 6.9 },
  { id: '2', name: 'Chicken Breast (cooked)', calories: 165, protein: 31, carbs: 0, fats: 3.6 },
  { id: '3', name: 'Brown Rice (cooked)', calories: 112, protein: 2.6, carbs: 23.5, fats: 0.9 },
  { id: '4', name: 'Paneer', calories: 265, protein: 18.3, carbs: 1.2, fats: 20.8 },
  { id: '5', name: 'Eggs (whole)', calories: 155, protein: 13, carbs: 1.1, fats: 11 },
]

export default function DietPlanBuilder() {
  const [planName, setPlanName] = useState('New Diet Plan')
  const [meals, setMeals] = useState([
    { id: 'meal1', name: 'Breakfast', items: [] }
  ])

  const [openAddFood, setOpenAddFood] = useState(false)
  const [activeMealId, setActiveMealId] = useState<string | null>(null)
  const [selectedFood, setSelectedFood] = useState<any>(null)
  const [quantity, setQuantity] = useState('100') // grams

  const handleAddMeal = () => {
    setMeals([...meals, { id: Date.now().toString(), name: `Meal ${meals.length + 1}`, items: [] }])
  }

  const handleRemoveMeal = (mealId: string) => {
    setMeals(meals.filter(m => m.id !== mealId))
  }

  const handleOpenAddFood = (mealId: string) => {
    setActiveMealId(mealId)
    setSelectedFood(null)
    setQuantity('100')
    setOpenAddFood(true)
  }

  const handleAddFood = () => {
    if (!selectedFood || !activeMealId) return
    const multiplier = parseFloat(quantity) / 100
    
    const foodItem = {
      uid: Date.now().toString(),
      ...selectedFood,
      qty: quantity,
      calcCals: Math.round(selectedFood.calories * multiplier),
      calcPro: (selectedFood.protein * multiplier).toFixed(1),
      calcCarbs: (selectedFood.carbs * multiplier).toFixed(1),
      calcFats: (selectedFood.fats * multiplier).toFixed(1)
    }

    setMeals(meals.map(m => {
      if (m.id === activeMealId) {
        return { ...m, items: [...m.items, foodItem] }
      }
      return m
    }))
    setOpenAddFood(false)
  }

  const handleRemoveFood = (mealId: string, itemUid: string) => {
    setMeals(meals.map(m => {
      if (m.id === mealId) {
        return { ...m, items: m.items.filter(i => i.uid !== itemUid) }
      }
      return m
    }))
  }

  // Calculate totals
  let totalCals = 0, totalPro = 0, totalCarbs = 0, totalFats = 0
  meals.forEach(m => {
    m.items.forEach(i => {
      totalCals += i.calcCals
      totalPro += parseFloat(i.calcPro)
      totalCarbs += parseFloat(i.calcCarbs)
      totalFats += parseFloat(i.calcFats)
    })
  })

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
            Diet Plan Builder
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Construct meal plans with automated macronutrient calculations.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<Save />}>
          Save Plan
        </Button>
      </Stack>

      <Stack direction="row" spacing={3}>
        {/* Left Column: Builder */}
        <Box flex={2}>
          <Card sx={{ mb: 4, bgcolor: '#1A1A2E', backgroundImage: 'none' }}>
            <CardContent>
              <TextField
                fullWidth
                label="Plan Name"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                variant="outlined"
                sx={{ mb: 3 }}
              />

              <Stack spacing={3}>
                {meals.map((meal, index) => (
                  <Card key={meal.id} variant="outlined" sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <TextField
                          size="small"
                          value={meal.name}
                          onChange={(e) => {
                            const newMeals = [...meals]
                            newMeals[index].name = e.target.value
                            setMeals(newMeals)
                          }}
                          sx={{ width: 250 }}
                        />
                        <IconButton color="error" onClick={() => handleRemoveMeal(meal.id)}>
                          <Delete />
                        </IconButton>
                      </Stack>

                      <Divider sx={{ mb: 2 }} />

                      {meal.items.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 1 }}>
                          No food items added yet.
                        </Typography>
                      ) : (
                        <Stack spacing={1} mb={2}>
                          {meal.items.map((item) => (
                            <Box key={item.uid} sx={{ display: 'flex', alignItems: 'center', p: 1.5, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                              <DragIndicator sx={{ color: 'text.secondary', mr: 2, cursor: 'grab' }} />
                              <Box flex={1}>
                                <Typography variant="subtitle2" fontWeight={600}>{item.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.qty}g • {item.calcCals} kcal • P: {item.calcPro}g • C: {item.calcCarbs}g • F: {item.calcFats}g
                                </Typography>
                              </Box>
                              <IconButton size="small" color="error" onClick={() => handleRemoveFood(meal.id, item.uid)}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}
                        </Stack>
                      )}

                      <Button
                        startIcon={<Add />}
                        onClick={() => handleOpenAddFood(meal.id)}
                        sx={{ mt: 1 }}
                      >
                        Add Food Item
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Stack>

              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleAddMeal}
                sx={{ mt: 3 }}
                fullWidth
              >
                Add Meal
              </Button>
            </CardContent>
          </Card>
        </Box>

        {/* Right Column: Macro Summary */}
        <Box flex={1}>
          <Card sx={{ bgcolor: '#1A1A2E', backgroundImage: 'none', position: 'sticky', top: 24 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={3}>Daily Macros</Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Calories</Typography>
                  <Typography variant="h4" color="primary.main" fontWeight={700}>{totalCals} <Typography component="span" variant="body1">kcal</Typography></Typography>
                </Box>
                <Divider />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Protein</Typography>
                  <Typography variant="subtitle1" fontWeight={600}>{totalPro.toFixed(1)}g</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Carbs</Typography>
                  <Typography variant="subtitle1" fontWeight={600}>{totalCarbs.toFixed(1)}g</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Fats</Typography>
                  <Typography variant="subtitle1" fontWeight={600}>{totalFats.toFixed(1)}g</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Add Food Dialog */}
      <Dialog open={openAddFood} onClose={() => setOpenAddFood(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Food Item</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Autocomplete
              options={FOOD_LIBRARY}
              getOptionLabel={(option) => option.name}
              onChange={(_, newValue) => setSelectedFood(newValue)}
              renderInput={(params) => <TextField {...params} label="Search Food Database" autoFocus />}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <Typography variant="body1">{option.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.calories} kcal • P:{option.protein}g C:{option.carbs}g F:{option.fats}g (per 100g)
                    </Typography>
                  </Box>
                </li>
              )}
            />
            {selectedFood && (
              <TextField 
                label="Quantity (grams)" 
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                fullWidth
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddFood(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddFood} disabled={!selectedFood || !quantity}>
            Add to Meal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
