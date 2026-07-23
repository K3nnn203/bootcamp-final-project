import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'

export default function Post() {
  return (
    <Card className='w-150'>
        <CardHeader>
            <div className='flex items-center gap-3'>
                <Avatar>
                    <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="@shadcn"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>Kenneth Ferlianto</CardTitle>
                    <CardDescription>@Knth19283 · 4h</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            putting navia a tier bellow lohen when all he does in his story quest is being cringe and have nothing to show for even when he's guilty while Navia have this
        </CardContent>
    </Card>
  )
}
