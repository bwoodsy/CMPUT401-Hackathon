const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

router.get('/', async (req , res) => {
  try {
    const { data, error } = await supabase
      .from('resume')
      .select('*');

    // Check if Supabase returned an error
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // express returns 200 by default
    return res.json(data);

  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// IMPORTANT: This route must come BEFORE /:id to avoid matching "user" as an id
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('resume')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Resume not found for this user' });
            }
            return res.status(500).json({ error: error.message });
        }

        return res.json(data);
    } catch (error) {
        console.error('Error fetching user resume:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/:id', async (req , res) => {
  try {
    const id = req.params.id;

    const { data, error } = await supabase
      .from('resume')
      .select('*')
      .eq('id', id)
      .single();

    // Check if Supabase returned an error
    if (error) {
        // PGRST116 is the code for "No rows found"
        if (error.code === 'PGRST116') {
            return res.status(404).json({ error: 'Resume not found' });
        }
        return res.status(500).json({ error: error.message });
    }

    // express returns 200 by default
    return res.json(data);

  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', async (req, res) => {
    try {
        const {
            firstName, lastName, email, phone, location, website,
            education, experience, skills, certifications, references,
            user_id
        } = req.body;

        console.log('Creating resume for user_id:', user_id);

        const contact = JSON.stringify({ firstName, lastName, email, phone, location, website });

        const insertData = { contact, education, experience, skills, certifications, references };

        // Only include user_id if it's provided
        if (user_id) {
            insertData.user_id = user_id;
        }

        console.log('Insert data:', insertData);

        const { data, error } = await supabase
            .from('resume')
            .insert([insertData])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json(data);
    } catch (error) {
        console.error('Error creating resume:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const { data, error } = await supabase
            .from('resume')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }   

        // make the sure the resume was found and deleted
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        return res.json({ message: 'Resume deleted successfully', data }); 
    } catch (error) {
        console.error('Error deleting Resume:', error);
        res.status(500).json({ error: 'Internal Server Error' });
}});

router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const {
            firstName, lastName, email, phone, location, website,
            education, experience, skills, certifications, references
        } = req.body;

        const allowedUpdates = {};

        // Build contact JSON if any contact field is provided
        const contactFields = { firstName, lastName, email, phone, location, website };
        const hasContactField = Object.values(contactFields).some(v => v !== undefined);
        if (hasContactField) {
            allowedUpdates.contact = JSON.stringify(contactFields);
        }

        if (education !== undefined) allowedUpdates.education = education;
        if (experience !== undefined) allowedUpdates.experience = experience;
        if (skills !== undefined) allowedUpdates.skills = skills;
        if (certifications !== undefined) allowedUpdates.certifications = certifications;
        if (references !== undefined) allowedUpdates.references = references;

        if (Object.keys(allowedUpdates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        const { data, error } = await supabase
            .from('resume')
            .update(allowedUpdates)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Resume not found' });
        }
        return res.json(data);
    } catch (error) {
        console.error('Error updating resume:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;