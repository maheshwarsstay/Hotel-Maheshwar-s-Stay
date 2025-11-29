'use client'

import { useState, useEffect } from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import dayjs from 'dayjs'
import './styles.css'

export default function BookingForm() {
  const roomTypes = [
    { id: 'deluxe', name: 'Deluxe Room' },
    { id: 'super-deluxe', name: 'Super Deluxe Room' },
    { id: 'suite', name: 'Suite Room' },
    { id: 'premium-suite', name: 'Premium Suite' }
  ]

  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestMobile: '',
    numGuests: '',
    advancePaid: '',
    checkInDate: '',
    checkOutDate: '',
    checkInTime: '',
    checkOutTime: '',
    specialRequirements: ''
  })

  const [rooms, setRooms] = useState([
    { id: 1, roomType: 'deluxe', roomTypeName: 'Deluxe Room', quantity: 1, price: '' }
  ])

  const [totalAmount, setTotalAmount] = useState(0)
  const [numNights, setNumNights] = useState(0)
  const [amountLeft, setAmountLeft] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [errors, setErrors] = useState({})
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode) {
      setDarkMode(savedMode === 'true')
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const muiTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#667eea',
      },
    },
  })

  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate)
      const checkOut = new Date(formData.checkOutDate)
      const diffTime = checkOut - checkIn
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setNumNights(diffDays > 0 ? diffDays : 0)
    } else {
      setNumNights(0)
    }
  }, [formData.checkInDate, formData.checkOutDate])

  useEffect(() => {
    const roomsTotal = rooms.reduce((sum, room) => {
      return sum + (parseFloat(room.price) || 0) * (parseInt(room.quantity) || 0)
    }, 0)
    const nights = numNights > 0 ? numNights : 1
    setTotalAmount(roomsTotal * nights)
  }, [rooms, numNights])

  useEffect(() => {
    const advance = parseFloat(formData.advancePaid) || 0
    setAmountLeft(totalAmount - advance)
  }, [totalAmount, formData.advancePaid])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleRoomChange = (id, field, value) => {
    setRooms(prevRooms => 
      prevRooms.map(room => {
        if (room.id === id) {
          const updatedRoom = { ...room, [field]: value }
          if (field === 'roomType') {
            const selectedType = roomTypes.find(type => type.id === value)
            updatedRoom.roomTypeName = selectedType ? selectedType.name : ''
          }
          return updatedRoom
        }
        return room
      })
    )
  }

  const addRoom = () => {
    const newId = rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1
    setRooms([...rooms, { 
      id: newId, 
      roomType: 'deluxe', 
      roomTypeName: 'Deluxe Room',
      quantity: 1, 
      price: '' 
    }])
  }

  const removeRoom = (id) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter(room => room.id !== id))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.guestName.trim()) newErrors.guestName = 'Guest name is required'
    if (!formData.guestEmail.trim()) {
      newErrors.guestEmail = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.guestEmail)) {
      newErrors.guestEmail = 'Email is invalid'
    }
    if (!formData.guestMobile.trim()) newErrors.guestMobile = 'Mobile number is required'
    if (!formData.numGuests || formData.numGuests < 1) newErrors.numGuests = 'At least 1 guest required'
    
    rooms.forEach((room, index) => {
      if (!room.price || room.price <= 0) {
        newErrors[`room_${room.id}_price`] = 'Price required'
      }
      if (!room.quantity || room.quantity < 1) {
        newErrors[`room_${room.id}_quantity`] = 'Quantity required'
      }
    })
    
    if (formData.advancePaid === '' || formData.advancePaid < 0) newErrors.advancePaid = 'Advance paid must be 0 or more'
    if (!formData.checkInDate) newErrors.checkInDate = 'Check-in date is required'
    if (!formData.checkOutDate) {
      newErrors.checkOutDate = 'Check-out date is required'
    } else if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate)
      const checkOut = new Date(formData.checkOutDate)
      if (checkOut <= checkIn) {
        newErrors.checkOutDate = 'Check-out must be after check-in'
      }
    }
    if (!formData.checkInTime) newErrors.checkInTime = 'Check-in time is required'
    if (!formData.checkOutTime) newErrors.checkOutTime = 'Check-out time is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix the errors in the form' })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          rooms: rooms,
          numNights: numNights,
          totalAmount: totalAmount,
          amountLeft: amountLeft
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Booking confirmation email sent successfully.' })
        setFormData({
          guestName: '',
          guestEmail: '',
          guestMobile: '',
          numGuests: '',
          advancePaid: '',
          checkInDate: '',
          checkOutDate: '',
          checkInTime: '',
          checkOutTime: '',
          specialRequirements: ''
        })
        setRooms([{ id: 1, roomType: 'deluxe', roomTypeName: 'Deluxe Room', quantity: 1, price: '' }])
        setTotalAmount(0)
        setAmountLeft(0)
      } else {
        setMessage({ type: 'error', text: data.error || 'Unable to send email. Please check SMTP settings.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Unable to send email. Please check SMTP settings.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <div className="navbar-logo">H</div>
            <div className="navbar-title">Hotel Maheshwar's Stay</div>
          </div>
          <div className="navbar-info">
            <div className="navbar-contact">
              <span className="navbar-contact-icon">📞</span>
              <span>9589007200</span>
            </div>
            <div className="navbar-contact">
              <span className="navbar-contact-icon">📍</span>
              <span>MG Road, Maheshwar</span>
            </div>
            <button 
              onClick={toggleDarkMode} 
              className="theme-toggle"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="card">
          <div className="card-header">
            <div className="card-icon">✉️</div>
            <h1 className="card-title">Booking Confirmation Email Sender</h1>
            <p className="card-subtitle">Fill in the booking details below to send a confirmation email to the guest</p>
          </div>

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <div className="form-group">
              <label className="label">Guest Name *</label>
              <input
                type="text"
                name="guestName"
                value={formData.guestName}
                onChange={handleChange}
                className={`input ${errors.guestName ? 'error' : ''}`}
                placeholder="Enter guest name"
              />
              {errors.guestName && <span className="error-text">{errors.guestName}</span>}
            </div>
            <div className="form-group">
              <label className="label">Guest Email *</label>
              <input
                type="email"
                name="guestEmail"
                value={formData.guestEmail}
                onChange={handleChange}
                className={`input ${errors.guestEmail ? 'error' : ''}`}
                placeholder="guest@example.com"
              />
              {errors.guestEmail && <span className="error-text">{errors.guestEmail}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Guest Mobile Number *</label>
              <input
                type="tel"
                name="guestMobile"
                value={formData.guestMobile}
                onChange={handleChange}
                className={`input ${errors.guestMobile ? 'error' : ''}`}
                placeholder="Enter mobile number"
              />
              {errors.guestMobile && <span className="error-text">{errors.guestMobile}</span>}
            </div>
            <div className="form-group">
              <label className="label">Number of Guests *</label>
              <input
                type="number"
                name="numGuests"
                value={formData.numGuests}
                onChange={handleChange}
                className={`input ${errors.numGuests ? 'error' : ''}`}
                min="1"
                placeholder="1"
              />
              {errors.numGuests && <span className="error-text">{errors.numGuests}</span>}
            </div>
          </div>

          <div className="rooms-section">
            <div className="rooms-header">
              <label className="label">Room Details *</label>
              <button type="button" onClick={addRoom} className="add-room-btn">
                + Add Room
              </button>
            </div>

            {rooms.map((room, index) => (
              <div key={room.id} className="room-item">
                <div className="room-item-header">
                  <span className="room-number">Room {index + 1}</span>
                  {rooms.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeRoom(room.id)} 
                      className="remove-room-btn"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="label-small">Room Type</label>
                    <select
                      value={room.roomType}
                      onChange={(e) => handleRoomChange(room.id, 'roomType', e.target.value)}
                      className="input"
                    >
                      {roomTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label-small">Price per Room</label>
                    <input
                      type="number"
                      value={room.price}
                      onChange={(e) => handleRoomChange(room.id, 'price', e.target.value)}
                      className={`input ${errors[`room_${room.id}_price`] ? 'error' : ''}`}
                      min="0"
                      step="0.01"
                      placeholder="Enter price"
                    />
                    {errors[`room_${room.id}_price`] && (
                      <span className="error-text">{errors[`room_${room.id}_price`]}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="label-small">Quantity</label>
                    <input
                      type="number"
                      value={room.quantity}
                      onChange={(e) => handleRoomChange(room.id, 'quantity', e.target.value)}
                      className={`input ${errors[`room_${room.id}_quantity`] ? 'error' : ''}`}
                      min="1"
                      placeholder="1"
                    />
                    {errors[`room_${room.id}_quantity`] && (
                      <span className="error-text">{errors[`room_${room.id}_quantity`]}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="label-small">Subtotal</label>
                    <input
                      type="text"
                      value={`₹${((parseFloat(room.price) || 0) * (parseInt(room.quantity) || 0)).toFixed(2)}`}
                      readOnly
                      className="input readonly"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Number of Nights</label>
              <input
                type="text"
                value={numNights > 0 ? `${numNights} Night${numNights > 1 ? 's' : ''}` : 'Select dates'}
                readOnly
                className="input readonly"
              />
            </div>
            <div className="form-group">
              <label className="label">Total Amount</label>
              <input
                type="text"
                value={`₹${totalAmount.toFixed(2)}`}
                readOnly
                className="input readonly total-amount-field"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Advance Paid *</label>
              <input
                type="number"
                name="advancePaid"
                value={formData.advancePaid}
                onChange={handleChange}
                className={`input ${errors.advancePaid ? 'error' : ''}`}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
              {errors.advancePaid && <span className="error-text">{errors.advancePaid}</span>}
            </div>
            <div className="form-group">
              <label className="label">Amount Left</label>
              <input
                type="text"
                value={`₹${amountLeft.toFixed(2)}`}
                readOnly
                className="input readonly amount-left-field"
              />
            </div>
          </div>

          <ThemeProvider theme={muiTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div className="form-row">
                <div className="form-group">
                  <label className="label">Check-in Date *</label>
                  <DatePicker
                    value={formData.checkInDate ? dayjs(formData.checkInDate) : null}
                    onChange={(newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        checkInDate: newValue ? newValue.format('YYYY-MM-DD') : ''
                      }))
                      if (errors.checkInDate) {
                        setErrors(prev => ({ ...prev, checkInDate: '' }))
                      }
                    }}
                    minDate={dayjs()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.checkInDate,
                        helperText: errors.checkInDate,
                        className: 'mui-date-picker'
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Check-in Time *</label>
                  <TimePicker
                    value={formData.checkInTime ? dayjs(`2000-01-01 ${formData.checkInTime}`) : null}
                    onChange={(newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        checkInTime: newValue ? newValue.format('HH:mm') : ''
                      }))
                      if (errors.checkInTime) {
                        setErrors(prev => ({ ...prev, checkInTime: '' }))
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.checkInTime,
                        helperText: errors.checkInTime,
                        className: 'mui-date-picker'
                      }
                    }}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Check-out Date *</label>
                  <DatePicker
                    value={formData.checkOutDate ? dayjs(formData.checkOutDate) : null}
                    onChange={(newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        checkOutDate: newValue ? newValue.format('YYYY-MM-DD') : ''
                      }))
                      if (errors.checkOutDate) {
                        setErrors(prev => ({ ...prev, checkOutDate: '' }))
                      }
                    }}
                    minDate={formData.checkInDate ? dayjs(formData.checkInDate) : dayjs()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.checkOutDate,
                        helperText: errors.checkOutDate,
                        className: 'mui-date-picker'
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Check-out Time *</label>
                  <TimePicker
                    value={formData.checkOutTime ? dayjs(`2000-01-01 ${formData.checkOutTime}`) : null}
                    onChange={(newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        checkOutTime: newValue ? newValue.format('HH:mm') : ''
                      }))
                      if (errors.checkOutTime) {
                        setErrors(prev => ({ ...prev, checkOutTime: '' }))
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.checkOutTime,
                        helperText: errors.checkOutTime,
                        className: 'mui-date-picker'
                      }
                    }}
                  />
                </div>
              </div>
            </LocalizationProvider>
          </ThemeProvider>

          <div className="form-group-full">
            <label className="label">Special Requirements (Optional)</label>
            <textarea
              name="specialRequirements"
              value={formData.specialRequirements}
              onChange={handleChange}
              rows="4"
              className="input textarea"
              placeholder="Any special requests or requirements..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? 'Sending...' : 'Send Booking Email'}
          </button>
        </form>
        </div>
      </div>
    </>
  )
}
