import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import mongoose from 'mongoose';
import { User } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';

export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession({ req: request, ...authOptions });
  const _user: User = session?.user;

  if (!session || !_user) {
    console.error('User not authenticated');
    return new Response(
      JSON.stringify({ success: false, message: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Log the user ID for debugging
  console.log('User ID from session:', _user._id);

  let userId;
  try {
    userId = new mongoose.Types.ObjectId(_user._id);
  } catch (error) {
    console.error('Invalid user ID format:', _user._id);
    return new Response(
      JSON.stringify({ message: 'Invalid user ID', success: false }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  console.log('Fetching messages for user ID:', userId);

  try {
    const user = await UserModel.findById(userId).exec();

    if (!user) {
      console.error('User not found');
      return new Response(
        JSON.stringify({ message: 'User not found', success: false }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Log the messages fetched
    console.log('User found, messages:', user.messages || []);

    return new Response(
      JSON.stringify({ messages: user.messages || [] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error', success: false }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
