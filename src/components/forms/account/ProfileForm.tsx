'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

type ProfileFormData = {
  name: string
  email: string
  password: string
}

export default function ProfileForm() {
  const [avatar, setAvatar] = useState('/placeholder.svg')
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>()

  const onSubmit = (data: ProfileFormData) => {
    console.log(data)
    // Here you would typically send this data to your backend
    alert('Profile updated successfully!')
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={avatar} alt="Profile picture" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Label htmlFor="avatar" className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md">
              Change Picture
            </Label>
            <Input 
              id="avatar" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              {...register('name', { required: 'Name is required' })} 
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              {...register('email', { required: 'Email is required' })} 
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input 
              id="password" 
              type="password" 
              {...register('password', { minLength: { value: 8, message: 'Password must be at least 8 characters' } })} 
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full">Update Profile</Button>
        </form>
      </CardContent>
    </Card>
  )
}

